# Contract tests (Phase 0 golden baseline)

Recorded against the **unmodified upstream v0.3.8** images (`coil/hanabira.org`, digest-pinned)
running as a throwaway baseline. Every later phase (dependency bumps, static export, Rust port)
must keep these passing, or explain each diff on purpose.

| File | What |
|---|---|
| `route-map.md` / `routes.json` | Every backend route (express, dictionary, flask), where it is defined, and which frontend files call it. |
| `fixtures/*.json` | 82 request → response pairs: status + JSON body (Mongo `_id`/`__v` stripped, since the DBs re-seed each boot). Includes error shapes (400/404/405). |
| `furigana-corpus.jsonl` | 500 sentences (100 per JLPT level, deterministic sample of seeded grammar examples) with `convert/all` and `parse-split` output. |
| `index.json` | Fixture summary: status, size, item count, hash. |
| `verify.py` | Replays fixtures + corpus against a running instance, exit 0 = match. |
| `tools/` | The recorders (`record_fixtures.py`, `record_corpus.py`, `routemap.py`). |

```sh
HANABIRA_BASE=http://localhost:8888 python3 tests/contract/verify.py -v
```

Not recorded on purpose:
- Mutating flask routes (clone/store/flashcard POST, PATCH, DELETE): documented in `route-map.md` only.
- AI/DeepL routes: only the failure shape with dummy keys.
- `get-transcript` (needs YouTube) and `audio/:filename` (audio not shipped in the image).
