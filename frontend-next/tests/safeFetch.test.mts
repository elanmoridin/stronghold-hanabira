// Run: node --test tests/safeFetch.test.mts   (Node 22 strips TS types natively)
import { test } from "node:test";
import assert from "node:assert/strict";
import { isBlockedAddress, checkUrl, guardedLookup, BlockedUrlError } from "../src/lib/safeFetch.ts";

test("private, loopback, link-local and mapped addresses are blocked", () => {
  for (const ip of [
    "127.0.0.1", "127.8.8.8", "10.1.2.3", "172.16.0.1", "172.31.255.255", "192.168.1.1",
    "169.254.169.254", "100.100.100.100", "0.0.0.0", "224.0.0.1", "255.255.255.255",
    "::1", "::", "fe80::1", "fd00::1", "fc00::1", "ff02::1",
    "::ffff:127.0.0.1", "::ffff:7f00:1", "::ffff:10.0.0.1", "0:0:0:0:0:ffff:192.168.0.1",
    "64:ff9b::a00:1",
  ]) assert.equal(isBlockedAddress(ip), true, ip);
});

test("public addresses pass", () => {
  for (const ip of ["1.1.1.1", "8.8.8.8", "172.32.0.1", "100.128.0.1", "2606:4700:4700::1111", "::ffff:1.1.1.1"])
    assert.equal(isBlockedAddress(ip), false, ip);
});

test("checkUrl rejects bad schemes, ports, creds and literal private hosts", () => {
  for (const u of [
    "file:///etc/passwd", "gopher://x", "ftp://example.com/", "http://example.com:8080/",
    "http://user:pw@example.com/", "http://127.0.0.1/", "http://[::1]/", "http://[::ffff:7f00:1]/",
    "http://169.254.169.254/latest/meta-data/", "http://localhost/", "http://foo.localhost/",
    "http://nas.local/", "not a url",
  ]) assert.throws(() => checkUrl(u), BlockedUrlError, u);
  assert.equal(checkUrl("https://www.nhk.or.jp/news/").hostname, "www.nhk.or.jp");
});

test("decimal / hex IPv4 forms are normalized by URL and still blocked", () => {
  for (const u of ["http://2130706433/", "http://0x7f000001/", "http://0177.0.0.1/", "http://127.1/"])
    assert.throws(() => checkUrl(u), BlockedUrlError, u);
});

test("trailing-dot and mixed-case internal names are blocked", () => {
  for (const u of ["http://localhost./", "http://LOCALHOST/", "http://nas.local./", "http://[::1]./"])
    assert.throws(() => checkUrl(u), BlockedUrlError, u);
});

test("connect-time lookup refuses names that resolve to loopback (rebinding guard)", async () => {
  // "localhost" resolves via /etc/hosts on any box; checkUrl would stop it earlier,
  // so call the socket resolver directly to prove the second layer holds on its own
  const err = await new Promise((done) => guardedLookup("localhost", {}, (e: unknown) => done(e)));
  assert.ok(err instanceof BlockedUrlError, String(err));
});

test("redirect targets go through the same check", () => {
  // safeFetchText runs checkUrl(new URL(location, current)) for every hop
  for (const loc of ["http://127.0.0.1:1/", "//169.254.169.254/", "http://[::1]/x"])
    assert.throws(() => checkUrl(new URL(loc, "https://example.com/a").toString()), BlockedUrlError, loc);
});
