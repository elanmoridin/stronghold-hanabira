// SSRF guard for server-side fetches of user-supplied URLs (api/fetch-content).
//
// The check runs inside the socket's DNS lookup, i.e. on the address we actually
// connect to, so DNS rebinding (resolve public for the check, private for the
// connect) can't slip past it. Redirects are followed by hand and every hop goes
// through the same lookup.
import http from "node:http";
import https from "node:https";
import dns from "node:dns";
import net from "node:net";

const blocked = new net.BlockList();
// IPv4: this-network, private, CGNAT/Tailscale, loopback, link-local (cloud metadata),
// IETF/test-nets, benchmarking, multicast, reserved + broadcast.
for (const [addr, prefix] of [
  ["0.0.0.0", 8], ["10.0.0.0", 8], ["100.64.0.0", 10], ["127.0.0.0", 8],
  ["169.254.0.0", 16], ["172.16.0.0", 12], ["192.0.0.0", 24], ["192.0.2.0", 24],
  ["192.168.0.0", 16], ["198.18.0.0", 15], ["198.51.100.0", 24], ["203.0.113.0", 24],
  ["224.0.0.0", 4], ["240.0.0.0", 4],
] as const) blocked.addSubnet(addr, prefix, "ipv4");
// IPv6: unspecified, loopback, NAT64 (can embed private v4), discard, doc, ULA, link-local, multicast.
for (const [addr, prefix] of [
  ["::", 128], ["::1", 128], ["64:ff9b::", 96], ["64:ff9b:1::", 48], ["100::", 64],
  ["2001:db8::", 32], ["fc00::", 7], ["fe80::", 10], ["ff00::", 8],
] as const) blocked.addSubnet(addr, prefix, "ipv6");

export function isBlockedAddress(ip: string): boolean {
  const family = net.isIP(ip);
  if (family === 4) return blocked.check(ip, "ipv4");
  if (family === 6) {
    // IPv4-mapped (::ffff:10.0.0.1 / ::ffff:a00:1) -> judge the embedded v4 address
    const m = ip.toLowerCase().match(/^(?:0*:)*:?ffff:(.+)$/);
    if (m) {
      const tail = m[1];
      if (net.isIP(tail) === 4) return blocked.check(tail, "ipv4");
      const hex = tail.split(":");
      if (hex.length === 2) {
        const n = (parseInt(hex[0], 16) << 16) | parseInt(hex[1], 16);
        const v4 = [n >>> 24, (n >>> 16) & 255, (n >>> 8) & 255, n & 255].join(".");
        return blocked.check(v4, "ipv4");
      }
    }
    return blocked.check(ip, "ipv6");
  }
  return true; // not an IP at all: refuse
}

export class BlockedUrlError extends Error {}

const ALLOWED_PORTS = new Set(["", "80", "443"]);

export function checkUrl(raw: string): URL {
  let u: URL;
  try {
    u = new URL(raw);
  } catch {
    throw new BlockedUrlError("invalid URL");
  }
  if (u.protocol !== "http:" && u.protocol !== "https:") throw new BlockedUrlError("only http/https allowed");
  if (u.username || u.password) throw new BlockedUrlError("credentials in URL not allowed");
  if (!ALLOWED_PORTS.has(u.port)) throw new BlockedUrlError("only ports 80/443 allowed");
  // strip IPv6 brackets and the FQDN trailing dot ("localhost." == "localhost")
  const host = u.hostname.replace(/^\[|\]$/g, "").replace(/\.+$/, "").toLowerCase();
  if (net.isIP(host) && isBlockedAddress(host)) throw new BlockedUrlError("private/loopback target blocked");
  if (host === "localhost" || host.endsWith(".localhost") || host.endsWith(".local") || host.endsWith(".internal"))
    throw new BlockedUrlError("internal hostname blocked");
  return u;
}

// dns.lookup wrapper used as the socket's resolver: fails the connect if ANY
// resolved address is private, so the connection can only ever reach public IPs.
export function guardedLookup(hostname: string, options: any, callback: any) {
  dns.lookup(hostname, { ...options, all: true }, (err, addresses: dns.LookupAddress[]) => {
    if (err) return callback(err);
    const bad = addresses.find((a) => isBlockedAddress(a.address));
    if (bad || addresses.length === 0) {
      return callback(new BlockedUrlError(`${hostname} resolves to a blocked address`));
    }
    if (options && options.all) return callback(null, addresses);
    callback(null, addresses[0].address, addresses[0].family);
  });
}

export type SafeFetchResult = { status: number; url: string; contentType: string; body: string };

export async function safeFetchText(
  raw: string,
  { maxBytes = 5 * 1024 * 1024, timeoutMs = 10_000, maxRedirects = 3 } = {},
): Promise<SafeFetchResult> {
  let url = checkUrl(raw);
  for (let hop = 0; ; hop++) {
    const res = await requestOnce(url, maxBytes, timeoutMs);
    if (res.status >= 300 && res.status < 400 && res.location) {
      if (hop >= maxRedirects) throw new BlockedUrlError("too many redirects");
      url = checkUrl(new URL(res.location, url).toString());
      continue;
    }
    return { status: res.status, url: url.toString(), contentType: res.contentType, body: res.body };
  }
}

function requestOnce(url: URL, maxBytes: number, timeoutMs: number) {
  const mod = url.protocol === "https:" ? https : http;
  return new Promise<{ status: number; location?: string; contentType: string; body: string }>((resolve, reject) => {
    const req = mod.request(
      url,
      {
        method: "GET",
        lookup: guardedLookup as any,
        timeout: timeoutMs,
        headers: { "user-agent": "hanabira-text-import/1.0", accept: "text/html,application/xhtml+xml" },
      },
      (res) => {
        const status = res.statusCode ?? 0;
        const location = res.headers.location;
        const contentType = String(res.headers["content-type"] ?? "");
        if (status >= 300 && status < 400 && location) {
          res.resume();
          return resolve({ status, location, contentType, body: "" });
        }
        const chunks: Buffer[] = [];
        let size = 0;
        res.on("data", (c: Buffer) => {
          size += c.length;
          if (size > maxBytes) {
            req.destroy(new BlockedUrlError("response too large"));
            return;
          }
          chunks.push(c);
        });
        res.on("end", () => resolve({ status, contentType, body: Buffer.concat(chunks).toString("utf8") }));
        res.on("error", reject);
      },
    );
    req.on("timeout", () => req.destroy(new BlockedUrlError("upstream timeout")));
    req.on("error", reject);
    req.end();
  });
}
