// Static-export smoke server: serves frontend-next/out/ plus proxy stubs for
// /e-api /d-api /f-api to a backend host, mimicking the nginx routing used by the
// Dockhand test stack (stronghold repo compose/hanabira.yaml).
//
// Usage:
//   BACKEND_HOST=10.10.10.7 OUT_DIR=$PWD/out PORT=8899 node scripts/static-export-smoke.js
//
// OUT_DIR defaults to ./out relative to frontend-next; BACKEND_HOST defaults to 127.0.0.1.
// Then curl: homepage, a real exported slug (ls out/<route> first — slugs are raw
// unicode titles, guessed URLs 404), a dashboard combo, a markdown asset, and one
// proxied API call per prefix.
const http = require('http');
const fs = require('fs');
const path = require('path');

const OUT = process.env.OUT_DIR || path.join(__dirname, '..', 'frontend-next', 'out');
const HOST = process.env.BACKEND_HOST || '127.0.0.1';
const PORT = parseInt(process.env.PORT || '8899', 10);
const BACKENDS = {
  '/e-api': `http://${HOST}:8000`,
  '/d-api': `http://${HOST}:5200`,
  '/f-api': `http://${HOST}:5100`,
};

const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css',
  '.json': 'application/json', '.txt': 'text/plain', '.md': 'text/markdown',
  '.png': 'image/png', '.jpg': 'image/jpeg', '.svg': 'image/svg+xml', '.ico': 'image/x-icon',
  '.webp': 'image/webp', '.woff2': 'font/woff2' };

const server = http.createServer((req, res) => {
  const url = req.url.split('?')[0];
  const prefix = Object.keys(BACKENDS).find(p => url.startsWith(p));
  if (prefix) {
    const proxy = http.request(BACKENDS[prefix] + req.url, { method: req.method, headers: req.headers }, pr => {
      res.writeHead(pr.statusCode, pr.headers);
      pr.pipe(res);
    });
    proxy.on('error', e => { res.writeHead(502); res.end('proxy error: ' + e.message); });
    req.pipe(proxy);
    return;
  }
  const p = path.join(OUT, decodeURIComponent(url));
  if (fs.existsSync(p) && fs.statSync(p).isFile()) return serve(p);
  if (fs.existsSync(p + '.html')) return serve(p + '.html');
  if (fs.existsSync(path.join(p, 'index.html'))) return serve(path.join(p, 'index.html'));
  res.writeHead(404); res.end('not found: ' + url);

  function serve(f) {
    res.writeHead(200, { 'content-type': MIME[path.extname(f)] || 'application/octet-stream' });
    fs.createReadStream(f).pipe(res);
  }
});
server.listen(PORT, () => console.log(`smoke server on :${PORT}, out=${OUT}, backends=${HOST}`));
