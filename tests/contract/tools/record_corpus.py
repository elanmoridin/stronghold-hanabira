#!/usr/bin/env python3
"""Hanabira Phase 0: furigana/parser golden corpus.

Sentences come from the seeded grammar examples (all JLPT levels, `examples[].jp`),
deduped and sampled deterministically (sorted by sha1, first N per level, N≈100).
Each sentence is run through /d-api/v1/convert/all (hiragana/katakana/romaji/
okurigana/furigana) and /d-api/v1/parse-split mode=book (tokens + readings).
Output: out/contract/furigana-corpus.jsonl (one JSON object per line).
"""
import hashlib, json, os, pathlib, sys, urllib.request

BASE = (sys.argv[1] if len(sys.argv) > 1 else os.environ.get("HANABIRA_BASE", "http://localhost:8888")).rstrip("/")
FIX = pathlib.Path(__file__).parent / "out" / "contract" / "fixtures"
OUT = FIX.parent / "furigana-corpus.jsonl"
PER_LEVEL = 100

def post(path, body):
    req = urllib.request.Request(BASE + path, data=json.dumps(body, ensure_ascii=False).encode(),
                                 method="POST", headers={"Content-Type": "application/json"})
    with urllib.request.urlopen(req, timeout=60) as r:
        return json.loads(r.read())

picked = []
seen = set()
for lv in ["JLPT_N5", "JLPT_N4", "JLPT_N3", "JLPT_N2", "JLPT_N1"]:
    g = json.loads((FIX / f"e_grammars_{lv}.json").read_text())["response"]["body"]["grammars"]
    sents = {ex["jp"].strip() for gp in g for ex in gp.get("examples", []) if ex.get("jp", "").strip()}
    sents -= seen
    ranked = sorted(sents, key=lambda s: hashlib.sha1(s.encode()).hexdigest())[:PER_LEVEL]
    seen |= set(ranked)
    picked += [(lv, s) for s in ranked]
    print(lv, "available", len(sents), "picked", len(ranked))

with OUT.open("w") as f:
    for i, (lv, s) in enumerate(picked):
        rec = {"id": i, "level": lv, "text": s,
               "convert_all": post("/d-api/v1/convert/all", {"text": s}),
               "parse_split_book": post("/d-api/v1/parse-split", {"text": s, "mode": "book"})}
        f.write(json.dumps(rec, ensure_ascii=False, sort_keys=True) + "\n")
print("wrote", len(picked), "->", OUT)
