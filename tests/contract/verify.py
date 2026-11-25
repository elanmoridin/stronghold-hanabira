#!/usr/bin/env python3
"""Replay every golden fixture against a running Hanabira and report drift.

Usage: HANABIRA_BASE=http://host:port python3 tests/contract/verify.py [-v]
Exit 0 = all fixtures match (status + body, Mongo _id/__v stripped).
"""
import json, os, pathlib, sys, urllib.error, urllib.request

HERE = pathlib.Path(__file__).parent
BASE = os.environ.get("HANABIRA_BASE", "http://localhost:8888").rstrip("/")
VERBOSE = "-v" in sys.argv

def strip_ids(o):
    if isinstance(o, dict):
        return {k: strip_ids(v) for k, v in o.items() if k not in ("_id", "__v")}
    if isinstance(o, list):
        return [strip_ids(v) for v in o]
    return o

def call(method, path, body):
    data = json.dumps(body, ensure_ascii=False).encode() if body is not None else None
    req = urllib.request.Request(BASE + path, data=data, method=method,
                                 headers={"Content-Type": "application/json"} if data else {})
    try:
        with urllib.request.urlopen(req, timeout=60) as r:
            status, raw = r.status, r.read()
    except urllib.error.HTTPError as e:
        status, raw = e.code, e.read()
    try:
        return status, strip_ids(json.loads(raw))
    except Exception:
        return status, raw.decode("utf-8", "replace")[:2000]

fail = 0
fixtures = sorted((HERE / "fixtures").glob("*.json"))
for f in fixtures:
    rec = json.loads(f.read_text())
    rq, rs = rec["request"], rec["response"]
    status, body = call(rq["method"], rq["path"], rq["body"])
    ok = status == rs["status"] and body == rs["body"]
    if not ok:
        fail += 1
        print(f"FAIL {rec['name']}: status {status} (want {rs['status']})"
              + ("" if body == rs["body"] else ", body differs"))
    elif VERBOSE:
        print(f"ok   {rec['name']}")

corpus = HERE / "furigana-corpus.jsonl"
cfail = ctotal = 0
if corpus.exists():
    for line in corpus.read_text().splitlines():
        rec = json.loads(line)
        ctotal += 1
        _, ca = call("POST", "/d-api/v1/convert/all", {"text": rec["text"]})
        _, ps = call("POST", "/d-api/v1/parse-split", {"text": rec["text"], "mode": "book"})
        if ca != rec["convert_all"] or ps != rec["parse_split_book"]:
            cfail += 1
            if cfail <= 10:
                print(f"FAIL corpus #{rec['id']} {rec['text']}")

print(f"fixtures: {len(fixtures) - fail}/{len(fixtures)} match; corpus: {ctotal - cfail}/{ctotal} match")
sys.exit(1 if (fail or cfail) else 0)
