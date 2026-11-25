#!/usr/bin/env python3
"""Hanabira Phase 0: record golden fixtures from the running upstream v0.3.8 baseline.

Read-only: only GETs and non-mutating POSTs (parsers/converters/lookups).
Mutating flask endpoints (clone/store/flashcard POST/PATCH/DELETE) are NOT called;
their contract is documented from source in route-map.md instead.

Normalization: Mongo `_id` fields are stripped (the stack re-seeds every boot,
so ObjectIds change). Everything else is stored verbatim.
"""
import hashlib, json, os, pathlib, sys, time, urllib.error, urllib.parse, urllib.request

BASE = (sys.argv[1] if len(sys.argv) > 1 else os.environ.get("HANABIRA_BASE", "http://localhost:8888")).rstrip("/")
OUT = pathlib.Path(__file__).parent / "out" / "contract"
FIX = OUT / "fixtures"
FIX.mkdir(parents=True, exist_ok=True)

def strip_ids(o):
    if isinstance(o, dict):
        return {k: strip_ids(v) for k, v in o.items() if k not in ("_id", "__v")}
    if isinstance(o, list):
        return [strip_ids(v) for v in o]
    return o

def call(method, path, body=None):
    data = json.dumps(body, ensure_ascii=False).encode() if body is not None else None
    req = urllib.request.Request(BASE + path, data=data, method=method,
                                 headers={"Content-Type": "application/json"} if data else {})
    t = time.time()
    try:
        with urllib.request.urlopen(req, timeout=60) as r:
            status, raw, ctype = r.status, r.read(), r.headers.get("Content-Type", "")
    except urllib.error.HTTPError as e:
        status, raw, ctype = e.code, e.read(), e.headers.get("Content-Type", "")
    ms = int((time.time() - t) * 1000)
    try:
        payload = strip_ids(json.loads(raw))
        kind = "json"
    except Exception:
        payload = raw.decode("utf-8", "replace")[:2000]
        kind = "text"
    return status, ctype, kind, payload, ms, len(raw)

def q(path, **params):
    return path + ("?" + urllib.parse.urlencode(params) if params else "")

LEVELS = ["JLPT_N5", "JLPT_N4", "JLPT_N3", "JLPT_N2", "JLPT_N1"]
cases = []  # (name, method, path, body, note)

# ---- express (static content) ----
for lv in LEVELS:
    cases.append((f"e_grammar-titles_{lv}", "GET", q("/e-api/v1/grammar-titles", p_tag=lv), None, ""))
    cases.append((f"e_grammars_{lv}", "GET", q("/e-api/v1/grammars", p_tag=lv), None, ""))
    cases.append((f"e_kanji_{lv}", "GET", q("/e-api/v1/kanji", p_tag=lv), None, ""))
    cases.append((f"e_words_{lv}", "GET", q("/e-api/v1/words", p_tag=lv), None, ""))
    cases.append((f"e_tanos_words_{lv}_100", "GET", q("/e-api/v1/tanos_words", p_tag=lv, s_tag="100"), None, ""))
cases += [
    ("e_grammar-titles_missing-ptag", "GET", "/e-api/v1/grammar-titles", None, "expect 400"),
    ("e_grammar-titles_N3_encoded", "GET", q("/e-api/v1/grammar-titles", p_tag="JLPT_N3", type="encoded"), None, ""),
    ("e_grammars_N3_stag10", "GET", q("/e-api/v1/grammars", p_tag="JLPT_N3", s_tag="10"), None, "upstream returns empty list"),
    ("e_words_essential600_verbs-1", "GET", q("/e-api/v1/words", p_tag="essential_600_verbs", s_tag="verbs-1"), None, ""),
    ("e_words_suru600_verbs-1", "GET", q("/e-api/v1/words", p_tag="suru_essential_600_verbs", s_tag="verbs-1"), None, ""),
    ("e_kanji_missing-ptag", "GET", "/e-api/v1/kanji", None, "expect 400"),
    ("e_kanji_N3_part_1", "GET", q("/e-api/v1/kanji", p_tag="JLPT_N3", s_tag="part_1"), None, ""),
    ("e_reading_missing", "GET", q("/e-api/v1/reading", key="reading_1"), None, "expect 404 (no readings seeded?)"),
    ("e_grammar-details_ichiban", "POST", "/e-api/v1/grammar-details", {"title": "A が いちばん～ (A ga ichiban～)"}, ""),
    ("e_grammar-details_missing", "POST", "/e-api/v1/grammar-details", {}, "expect 400"),
    ("e_grammar-details_unknown", "POST", "/e-api/v1/grammar-details", {"title": "does-not-exist"}, ""),
]

# ---- dictionary (parsers, converters, lookups) ----
S = "今日は学校に行きます。昨日、友達と寿司屋で晩ご飯を食べました。"
cases += [
    ("d_parse-split_book", "POST", "/d-api/v1/parse-split", {"text": S, "mode": "book"}, ""),
    ("d_parse-split_lyrics", "POST", "/d-api/v1/parse-split", {"text": "いろはにほへと\n散りぬるを", "mode": "lyrics"}, ""),
    ("d_parse-split_badmode", "POST", "/d-api/v1/parse-split", {"text": S, "mode": "x"}, "expect 400"),
    ("d_parse-simple", "POST", "/d-api/v1/parse-simple", {"text": S}, "unused by UI"),
    ("d_parse", "POST", "/d-api/v1/parse", {"text": S}, "unused by UI"),
    ("d_parse-json", "POST", "/d-api/v1/parse-json", {"text": S}, "unused by UI"),
    ("d_convert_all", "POST", "/d-api/v1/convert/all", {"text": S}, ""),
    ("d_convert_furigana", "POST", "/d-api/v1/convert/furigana", {"text": S}, ""),
    ("d_convert_hiragana", "POST", "/d-api/v1/convert/hiragana", {"text": S}, ""),
    ("d_convert_katakana", "POST", "/d-api/v1/convert/katakana", {"text": S}, "unused by UI"),
    ("d_convert_romaji", "POST", "/d-api/v1/convert/romaji", {"text": S}, "unused by UI"),
    ("d_convert_okurigana", "POST", "/d-api/v1/convert/okurigana", {"text": S}, "unused by UI"),
    ("d_extract-kanji", "GET", q("/d-api/v1/extract-kanji", word="寿司屋で食べる"), None, ""),
    ("d_extract-kanji_missing", "GET", "/d-api/v1/extract-kanji", None, "expect 400"),
    ("d_radical-info_str", "POST", "/d-api/v1/radical-info", {"kanjiList": "寿司"}, ""),
    ("d_radical-info_empty", "POST", "/d-api/v1/radical-info", {"kanjiList": []}, "expect 400"),
    ("d_get-transcript_missing", "GET", "/d-api/v1/get-transcript", None, "needs YouTube; error shape only"),
    ("d_audio_missing", "GET", "/d-api/v1/audio/does-not-exist.mp3", None, "expect 404"),
    # AI / DeepL: dummy keys in Phase 0 -> record the failure shape only
    ("d_deepl-translate_dummykey", "POST", "/d-api/v1/deepl-translate", {"japaneseText": "こんにちは"}, "dummy key; failure shape"),
    ("d_translate_dummykey", "POST", "/d-api/v1/translate", {"userPrompt": "こんにちは"}, "dummy key; failure shape"),
    ("d_grammar_dummykey", "POST", "/d-api/v1/grammar", {"userPrompt": "こんにちは"}, "dummy key; failure shape"),
]
for w in ["寿司屋", "食べる", "学校", "同じだ", "ありがとう", "猫", "zzzz"]:
    cases.append((f"d_simple-vocabulary_{w}", "GET", "/d-api/v1/simple-vocabulary/" + urllib.parse.quote(w), None, ""))
for k in ["寿", "食", "学", "猫", "a"]:
    cases.append((f"d_kanji_{k}", "GET", "/d-api/v1/kanji/" + urllib.parse.quote(k), None, ""))

# ---- flask (read-only GETs; fresh user => empty-state contract) ----
U = "contractFixtureUser"
cases += [
    ("f_streak_nouser", "GET", f"/f-api/v1/streak/{U}", None, "expect 404 (no logins)"),
    ("f_get-logins_nouser", "GET", f"/f-api/v1/get-logins/{U}", None, ""),
    ("f_japanese-texts_nouser", "GET", f"/f-api/v1/japanese-texts/{U}", None, ""),
    ("f_custom-videos_nouser", "GET", q("/f-api/v1/custom-videos", userId=U, p_tag="youtube", s_tag="all", lang="jp"), None, ""),
    ("f_text-parser-words_nouser", "GET", q("/f-api/v1/text-parser-words", userId=U, collectionName="vocabulary", p_tag="sentence_mining", s_tag="verbs-1"), None, "sentence-mining empty state (UI shows Loading... forever)"),
    ("f_text-parser-words_missing", "GET", "/f-api/v1/text-parser-words", None, "expect 400"),
    ("f_flashcard-states_nouser", "GET", q(f"/f-api/v1/flashcard/{U}", collectionName="words", p_tag="JLPT_N3", s_tag="all"), None, ""),
    ("f_combine-words_nouser", "GET", q("/f-api/v1/combine-flashcard-data-words", userId=U, collectionName="words", p_tag="JLPT_N3", s_tag="verbs-1"), None, ""),
    ("f_combine-kanji_nouser", "GET", q("/f-api/v1/combine-flashcard-data-kanji", userId=U, collectionName="kanji", p_tag="JLPT_N3", s_tag="part_1"), None, ""),
    ("f_combine-grammars_nouser", "GET", q("/f-api/v1/combine-flashcard-data-grammars", userId=U, collectionName="grammars", p_tag="JLPT_N5", s_tag="all"), None, ""),
    ("f_enhance-vocabulary_nouser", "POST", "/f-api/v1/enhance-vocabulary", {"userId": U, "data": []}, "read-only lookup"),
    ("f_enhance-vocabulary_missing", "POST", "/f-api/v1/enhance-vocabulary", {"data": []}, "expect 400"),
    ("f_flashcard_GET_405", "GET", "/f-api/v1/flashcard", None, "POST-only route"),
]

index = []
for name, method, path, body, note in cases:
    status, ctype, kind, payload, ms, size = call(method, path, body)
    rec = {"name": name, "request": {"method": method, "path": path, "body": body},
           "response": {"status": status, "content_type": ctype.split(";")[0], "kind": kind, "body": payload},
           "note": note}
    fn = FIX / f"{name}.json"
    fn.write_text(json.dumps(rec, ensure_ascii=False, indent=1, sort_keys=True) + "\n")
    digest = hashlib.sha256(json.dumps(payload, ensure_ascii=False, sort_keys=True).encode()).hexdigest()[:16]
    n_items = len(payload) if isinstance(payload, list) else (
        max((len(v) for v in payload.values() if isinstance(v, list)), default=None) if isinstance(payload, dict) else None)
    index.append({"name": name, "method": method, "path": path, "status": status, "bytes": size,
                  "items": n_items, "ms": ms, "sha16": digest, "note": note})
    print(f"{status} {size:>8}B {ms:>5}ms  {name}")

(OUT / "index.json").write_text(json.dumps({"base": "upstream v0.3.8 (coil/hanabira.org digests, see compose/hanabira.yaml in stronghold)",
                                            "recorded_utc": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
                                            "cases": index}, ensure_ascii=False, indent=1) + "\n")
print("cases:", len(index))
