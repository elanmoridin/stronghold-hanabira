# Hanabira route map (upstream v0.3.8, generated Phase 0)

Backend routes: 74 — used by frontend: 55, unused: 19.
Frontend call sites scanned: 84; unmatched: 1.

## express

| used | method | path | defined | callers |
|---|---|---|---|---|
| yes | POST | `/e-api/v1/grammar-details` | backend/express/my_server.js:266 | 7 (frontend-next/src/app/grammarpoint/[slug]/page.tsx:36) |
| yes | GET | `/e-api/v1/grammar-titles` | backend/express/my_server.js:214 | 5 (frontend-next/src/components/ComplexFlashcardModalKanjiFlask.tsx:70) |
| yes | GET | `/e-api/v1/grammars` | backend/express/my_server.js:204 | 5 (frontend-next/src/app/japanese/grammar_dashboard/[slug]/[id]/page.tsx:63) |
| yes | GET | `/e-api/v1/kanji` | backend/express/my_server.js:393 | 7 (frontend-next/src/app/japanese/quick_kanji/page.tsx:151) |
| yes | POST | `/e-api/v1/korean/grammar-details` | backend/express/my_server.js:316 | 5 (frontend-next/src/app/langs/korean/grammarpoint/[slug]/page.tsx:33) |
| yes | POST | `/e-api/v1/mandarin/grammar-details` | backend/express/my_server.js:365 | 5 (frontend-next/src/app/langs/mandarin/grammarpoint/[slug]/page.tsx:61) |
| yes | GET | `/e-api/v1/reading` | backend/express/my_server.js:425 | 5 (frontend-next/src/app/japanese/reading/[slug]/page.tsx:52) |
| yes | GET | `/e-api/v1/tanos_words` | backend/express/my_server.js:194 | 7 (frontend-next/src/app/english/quick_vocab/page.tsx:1025) |
| yes | POST | `/e-api/v1/thai/grammar-details` | backend/express/my_server.js:342 | 5 (frontend-next/src/app/langs/thai/grammarpoint/[slug]/page.tsx:39) |
| yes | POST | `/e-api/v1/vietnamese/grammar-details` | backend/express/my_server.js:293 | 5 (frontend-next/src/app/langs/vietnamese/grammarpoint/[slug]/page.tsx:39) |
| yes | GET | `/e-api/v1/words` | backend/express/my_server.js:182 | 5 (frontend-next/src/components/ComplexFlashcardModalKanjiFlask.tsx:70) |

## dictionary

| used | method | path | defined | callers |
|---|---|---|---|---|
| yes | GET | `/d-api/v1/audio/:filename` | backend/dictionary/main_server.js:1485 | 1 (frontend-next/src/components-parser/WordDetailsSidebar.tsx:41) |
| yes | POST | `/d-api/v1/convert/all` | backend/dictionary/main_server.js:432 | 2 (frontend-next/src/app/text-parser/page.tsx:155) |
| yes | POST | `/d-api/v1/convert/furigana` | backend/dictionary/main_server.js:421 | 2 (frontend-next/src/components-parser/FuriganaConverter.tsx:18) |
| yes | POST | `/d-api/v1/convert/hiragana` | backend/dictionary/main_server.js:383 | 1 (frontend-next/src/app/text-parser/page.tsx:158) |
| yes | POST | `/d-api/v1/deepl-translate` | backend/dictionary/main_server.js:321 | 1 (frontend-next/src/app/text-parser/page.tsx:156) |
| yes | GET | `/d-api/v1/extract-kanji` | backend/dictionary/main_server.js:562 | 1 (frontend-next/src/app/text-parser/page.tsx:152) |
| yes | GET | `/d-api/v1/get-transcript` | backend/dictionary/main_server.js:1407 | 2 (frontend-next/src/app/text-parser/page.tsx:250) |
| yes | POST | `/d-api/v1/grammar` | backend/dictionary/main_server.js:1125 | 2 (frontend-next/src/app/grammar-graph/page.tsx:12) |
| yes | GET | `/d-api/v1/kanji/:character` | backend/dictionary/main_server.js:474 | 1 (frontend-next/src/app/text-parser/page.tsx:153) |
| yes | POST | `/d-api/v1/parse-split` | backend/dictionary/main_server.js:282 | 2 (frontend-next/src/app/text-parser/page.tsx:154) |
| yes | POST | `/d-api/v1/parse-tree` | backend/dictionary/main_server.js:1348 | 1 (frontend-next/src/app/grammar-graph/page.tsx:99) |
| yes | POST | `/d-api/v1/radical-info` | backend/dictionary/main_server.js:653 | 1 (frontend-next/src/app/text-parser/page.tsx:160) |
| yes | POST | `/d-api/v1/sentiment` | backend/dictionary/main_server.js:1198 | 1 (frontend-next/src/app/text-parser/page.tsx:167) |
| yes | GET | `/d-api/v1/simple-vocabulary/:expression` | backend/dictionary/main_server.js:584 | 1 (frontend-next/src/app/text-parser/page.tsx:157) |
| yes | POST | `/d-api/v1/summary` | backend/dictionary/main_server.js:1175 | 1 (frontend-next/src/app/text-parser/page.tsx:166) |
| yes | POST | `/d-api/v1/translate` | backend/dictionary/main_server.js:1140 | 2 (frontend-next/src/app/text-parser/page.tsx:164) |
| yes | POST | `/d-api/v1/translate-side-by-side` | backend/dictionary/main_server.js:1150 | 1 (frontend-next/src/app/text-parser/page.tsx:165) |
| - | POST | `/d-api/v1/antonyms` | backend/dictionary/main_server.js:1247 | 0  |
| - | POST | `/d-api/v1/collocations` | backend/dictionary/main_server.js:1277 | 0  |
| - | POST | `/d-api/v1/convert/katakana` | backend/dictionary/main_server.js:391 | 0  |
| - | POST | `/d-api/v1/convert/okurigana` | backend/dictionary/main_server.js:410 | 0  |
| - | POST | `/d-api/v1/convert/romaji` | backend/dictionary/main_server.js:399 | 0  |
| - | POST | `/d-api/v1/hypernyms` | backend/dictionary/main_server.js:1257 | 0  |
| - | POST | `/d-api/v1/hyponyms` | backend/dictionary/main_server.js:1267 | 0  |
| - | POST | `/d-api/v1/idioms` | backend/dictionary/main_server.js:1297 | 0  |
| - | GET | `/d-api/v1/metrics` | backend/dictionary/main_server.js:1323 | 0  |
| - | POST | `/d-api/v1/parse` | backend/dictionary/main_server.js:205 | 0  |
| - | POST | `/d-api/v1/parse-json` | backend/dictionary/main_server.js:220 | 0  |
| - | POST | `/d-api/v1/parse-simple` | backend/dictionary/main_server.js:233 | 0  |
| - | POST | `/d-api/v1/part-of-speech` | backend/dictionary/main_server.js:1287 | 0  |
| - | POST | `/d-api/v1/pronounciation-similarity` | backend/dictionary/main_server.js:1307 | 0  |
| - | POST | `/d-api/v1/synonyms` | backend/dictionary/main_server.js:1237 | 0  |
| - | POST | `/d-api/v1/verb-conjugation` | backend/dictionary/main_server.js:1217 | 0  |
| - | POST | `/d-api/v1/word-similarity` | backend/dictionary/main_server.js:1227 | 0  |

## flask

| used | method | path | defined | callers |
|---|---|---|---|---|
| yes | POST | `/f-api/v1/clone-static-collection-grammars` | backend/flask/modules/flashcards.py:571 | 1 (frontend-next/src/app/japanese/flashcards/page.tsx:193) |
| yes | POST | `/f-api/v1/clone-static-collection-kanji` | backend/flask/modules/flashcards.py:113 | 2 (frontend-next/src/app/japanese/flashcards/page.tsx:130) |
| yes | POST | `/f-api/v1/clone-static-collection-words` | backend/flask/modules/flashcards.py:242 | 1 (frontend-next/src/app/japanese/flashcards/page.tsx:172) |
| yes | GET | `/f-api/v1/combine-flashcard-data-grammars` | backend/flask/modules/flashcards.py:736 | 3 (frontend-next/src/components/ComplexFlashcardModalGrammarFlask.tsx:63) |
| yes | POST | `/f-api/v1/combine-flashcard-data-grammars` | backend/flask/modules/flashcards.py:736 | 3 (frontend-next/src/components/ComplexFlashcardModalGrammarFlask.tsx:63) |
| yes | GET | `/f-api/v1/combine-flashcard-data-kanji` | backend/flask/modules/flashcards.py:384 | 2 (frontend-next/src/components/ComplexFlashcardModalKanjiFlask.tsx:68) |
| yes | POST | `/f-api/v1/combine-flashcard-data-kanji` | backend/flask/modules/flashcards.py:384 | 2 (frontend-next/src/components/ComplexFlashcardModalKanjiFlask.tsx:68) |
| yes | GET | `/f-api/v1/combine-flashcard-data-words` | backend/flask/modules/flashcards.py:466 | 2 (frontend-next/src/components/ComplexFlashcardModalKanjiFlask.tsx:68) |
| yes | POST | `/f-api/v1/combine-flashcard-data-words` | backend/flask/modules/flashcards.py:466 | 2 (frontend-next/src/components/ComplexFlashcardModalKanjiFlask.tsx:68) |
| yes | GET | `/f-api/v1/custom-videos` | backend/flask/modules/library.py:127 | 2 (frontend-next/src/app/my-podcasts/page.tsx:39) |
| yes | POST | `/f-api/v1/custom-videos` | backend/flask/modules/library.py:161 | 2 (frontend-next/src/app/my-podcasts/page.tsx:39) |
| yes | DELETE | `/f-api/v1/custom-videos/<id>` | backend/flask/modules/library.py:193 | 1 (frontend-next/src/app/my-podcasts/page.tsx:72) |
| yes | POST | `/f-api/v1/enhance-vocabulary` | backend/flask/modules/vocabulary_mining.py:88 | 2 (frontend-next/src/app/text-parser/page.tsx:170) |
| yes | POST | `/f-api/v1/flashcard` | backend/flask/modules/flashcards.py:1110 | 3 (frontend-next/src/components/ComplexFlashcardModalGrammarFlask.tsx:135) |
| yes | GET | `/f-api/v1/flashcard/<userId>` | backend/flask/modules/flashcards.py:923 | 1 (frontend-next/src/components/LearningProgressFlask.tsx:46) |
| yes | GET | `/f-api/v1/get-logins/<userId>` | backend/flask/modules/login_streak.py:52 | 1 (frontend-next/src/app/user-dashboard/page.tsx:84) |
| yes | POST | `/f-api/v1/japanese-texts` | backend/flask/modules/library.py:67 | 1 (frontend-next/src/app/custom-text/page.tsx:64) |
| yes | DELETE | `/f-api/v1/japanese-texts/<id>` | backend/flask/modules/library.py:108 | 2 (frontend-next/src/app/custom-text/page.tsx:46) |
| yes | GET | `/f-api/v1/japanese-texts/<userId>` | backend/flask/modules/library.py:25 | 2 (frontend-next/src/app/custom-text/page.tsx:46) |
| yes | POST | `/f-api/v1/notify-login` | backend/flask/modules/login_streak.py:22 | 2 (frontend-next/src/components/Sidebar.tsx:112) |
| yes | POST | `/f-api/v1/store-vocabulary-data` | backend/flask/modules/sentence_mining.py:23 | 1 (frontend-next/src/app/text-parser/page.tsx:172) |
| yes | POST | `/f-api/v1/submit_email` | backend/flask/modules/email_waitlist.py:22 | 1 (frontend-next/src/components/EmailForm.tsx:14) |
| yes | GET | `/f-api/v1/text-parser-words` | backend/flask/modules/sentence_mining.py:123 | 3 (frontend-next/src/app/my-vocabulary/page.tsx:28) |
| yes | POST | `/f-api/v1/text-parser-words` | backend/flask/modules/sentence_mining.py:194 | 3 (frontend-next/src/app/my-vocabulary/page.tsx:28) |
| yes | DELETE | `/f-api/v1/text-parser-words` | backend/flask/modules/sentence_mining.py:303 | 3 (frontend-next/src/app/my-vocabulary/page.tsx:28) |
| yes | PATCH | `/f-api/v1/text-parser-words/<string:record_id>` | backend/flask/modules/sentence_mining.py:253 | 1 (frontend-next/src/components/ComplexFlashcardModalVocabFlaskSentenceMining.tsx:126) |
| yes | POST | `/f-api/v1/user-vocabulary` | backend/flask/modules/vocabulary_mining.py:30 | 1 (frontend-next/src/app/text-parser/page.tsx:171) |
| - | GET | `/f-api/v1/streak/<userId>` | backend/flask/modules/login_streak.py:74 | 0  |
| - | GET | `/health` | backend/flask/server.py:34 | 0  |

## Frontend calls with no backend route

- `/f-api/v1/` — frontend-next/src/components/CloneButton.tsx:25
