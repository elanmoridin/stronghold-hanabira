# Static export deploy (Phase 3 test)

The frontend is a Next.js static export. The Dockhand test stack lives in the
stronghold repo (`compose/hanabira.yaml`) and serves these files from nginx while
proxying `/e-api` `/f-api` `/d-api` to the old backends.

## Build

```bash
cd frontend-next
npm ci --no-audit --no-fund   # first run only
npx next build                # emits out/ (~4,030 pages, ~313 MB)
```

## Deploy to Tower

Copy the **contents** of `frontend-next/out/` to `/mnt/user/appdata/hanabira/static`
so that `index.html` sits directly inside that directory, then deploy the
`hanabira` stack in Dockhand. The UI is served on port 8888 (and via TSDProxy as
`hanabira`).

Example (from a checkout of this repo):

```bash
rsync -a --delete frontend-next/out/ <tower>:/mnt/user/appdata/hanabira/static/
```

## Smoke test (no Tower needed)

Serves `out/` locally plus proxy stubs for the three API prefixes, mimicking the
nginx routing:

```bash
BACKEND_HOST=<backend-host> OUT_DIR=$PWD/out node scripts/static-export-smoke.js
# then, e.g.:
curl -s -o /dev/null -w '%{http_code}\n' http://localhost:8899/
curl -s -o /dev/null -w '%{http_code}\n' "http://localhost:8899/e-api/v1/grammar-titles?p_tag=JLPT_N5"
```

Note: grammarpoint slugs are raw unicode titles — `ls out/japanese/grammarpoint`
for real filenames before curling; guessed URLs 404 even when the export is fine.
