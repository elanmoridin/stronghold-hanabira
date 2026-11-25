#!/usr/bin/env python3
"""Hanabira Phase 0: inventory backend routes and frontend call sites, cross-match.
Output: routes.json + route-map.md in ./out"""
import json, os, re, pathlib

SRC = pathlib.Path(__file__).parent / "src"
OUT = pathlib.Path(__file__).parent / "out"
OUT.mkdir(exist_ok=True)
SKIP = re.compile(r"/(deprecated|components-inactive|node_modules|json_data_copy)/|copy|\.bak|_old|old_|main_server_v2|/server\.js$")

routes = []
# express + dictionary (node)
for svc, f in [("express", "backend/express/my_server.js"), ("dictionary", "backend/dictionary/main_server.js")]:
    for n, line in enumerate((SRC / f).read_text(errors="replace").splitlines(), 1):
        if line.lstrip().startswith("//"):
            continue
        m = re.search(r"app\.(get|post|put|patch|delete)\(\s*['\"]([^'\"]+)", line)
        if m:
            routes.append({"svc": svc, "method": m.group(1).upper(), "path": m.group(2), "src": f"{f}:{n}"})
# flask
for f in sorted((SRC / "backend/flask").rglob("*.py")):
    rel = str(f.relative_to(SRC))
    if SKIP.search(rel) or "/venv/" in rel:
        continue
    lines = f.read_text(errors="replace").splitlines()
    for n, line in enumerate(lines, 1):
        if line.lstrip().startswith("#"):
            continue
        m = re.search(r"\.route\(\s*['\"]([^'\"]+)['\"](.*)", line)
        if m:
            meth = re.findall(r"['\"](GET|POST|PUT|PATCH|DELETE)['\"]", m.group(2)) or ["GET"]
            for mm in meth:
                routes.append({"svc": "flask", "method": mm, "path": m.group(1), "src": f"{rel}:{n}"})

# dedupe (same svc/method/path defined twice -> keep first, note dup)
seen = {}
for r in routes:
    k = (r["svc"], r["method"], r["path"])
    if k in seen:
        seen[k].setdefault("dups", []).append(r["src"])
    else:
        seen[k] = r
routes = list(seen.values())

def to_regex(p):
    p = re.sub(r"<[^>]+>", "[^/]+", p)       # flask <x>
    p = re.sub(r":[A-Za-z_]+", "[^/]+", p)   # express :x
    return re.compile("^" + p + "$")
for r in routes:
    r["_re"] = to_regex(r["path"])
    r["callers"] = []

# frontend call sites
calls = []
api_re = re.compile(r"/([edf])-api/v1/([^\s`'\"?]*)")
for f in sorted((SRC / "frontend-next/src").rglob("*")):
    if f.suffix not in (".ts", ".tsx", ".js", ".jsx"):
        continue
    rel = str(f.relative_to(SRC))
    if SKIP.search(rel):
        continue
    for n, line in enumerate(f.read_text(errors="replace").splitlines(), 1):
        s = line.strip()
        if s.startswith("//") or s.startswith("*") or s.startswith("{/*"):
            continue
        for m in api_re.finditer(line):
            raw = f"/{m.group(1)}-api/v1/{m.group(2)}"
            norm = re.sub(r"\$\{[^}]*\}", "X", raw).rstrip("/")
            calls.append({"file": rel, "line": n, "raw": raw, "norm": norm})

unmatched = []
for c in calls:
    hit = [r for r in routes if r["_re"].match(c["norm"]) or r["path"].rstrip("/") == c["norm"]]
    if not hit:  # template-built paths (prefix + var), match by prefix
        hit = [r for r in routes if c["norm"].endswith("X") and r["path"].startswith(c["norm"][:-1])]
    if not hit and not re.fullmatch(r"/[edf]-api/v1", c["norm"]):  # base URL built then "/"+param appended at runtime
        hit = [r for r in routes if r["path"].startswith(c["norm"] + "/")]
        if hit: c["prefix_only"] = True
    for r in hit:
        r["callers"].append(f'{c["file"]}:{c["line"]}')
    if not hit:
        unmatched.append(c)

for r in routes:
    del r["_re"]
    r["used"] = bool(r["callers"])
json.dump({"routes": routes, "unmatched_calls": unmatched}, open(OUT / "routes.json", "w"), ensure_ascii=False, indent=1)

# markdown
used = [r for r in routes if r["used"]]
md = ["# Hanabira route map (upstream v0.3.8, generated Phase 0)", "",
      f"Backend routes: {len(routes)} — used by frontend: {len(used)}, unused: {len(routes)-len(used)}.",
      f"Frontend call sites scanned: {len(calls)}; unmatched: {len(unmatched)}.", ""]
for svc in ("express", "dictionary", "flask"):
    md += [f"## {svc}", "", "| used | method | path | defined | callers |", "|---|---|---|---|---|"]
    for r in sorted([r for r in routes if r["svc"] == svc], key=lambda r: (not r["used"], r["path"])):
        cs = sorted(set(r["callers"]))
        md.append(f'| {"yes" if r["used"] else "-"} | {r["method"]} | `{r["path"]}` | {r["src"]} | {len(cs)} {"(" + cs[0] + ")" if cs else ""} |')
    md.append("")
if unmatched:
    md += ["## Frontend calls with no backend route", ""]
    for c in unmatched:
        md.append(f'- `{c["raw"]}` — {c["file"]}:{c["line"]}')
(OUT / "route-map.md").write_text("\n".join(md) + "\n")
print(f"routes={len(routes)} used={len(used)} calls={len(calls)} unmatched={len(unmatched)}")
for svc in ("express", "dictionary", "flask"):
    rs = [r for r in routes if r["svc"] == svc]
    print(svc, len(rs), "used", sum(r["used"] for r in rs))
print("unmatched:", sorted({c["norm"] for c in unmatched}))
