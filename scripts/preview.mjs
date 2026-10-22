import http from 'node:http';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import chat from '../netlify/functions/chat.mjs';

const root = fileURLToPath(new URL('../dist/', import.meta.url));
const port = Number(process.env.PORT || 4174);
const mime = { '.html': 'text/html; charset=utf-8', '.css': 'text/css', '.js': 'application/javascript', '.jpg': 'image/jpeg', '.svg': 'image/svg+xml' };
http.createServer(async (req, res) => {
  let filename;
  try {
    const url = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);
    if (url === '/api/chat') {
      const chunks = [];
      let length = 0;
      for await (const chunk of req) {
        length += chunk.length;
        if (length > 12000) { res.writeHead(413).end('Message too long.'); return; }
        chunks.push(chunk);
      }
      const response = await chat(new Request(`http://${req.headers.host}/api/chat`, {
        method: req.method, headers: req.headers,
        body: ['GET', 'HEAD'].includes(req.method) ? undefined : Buffer.concat(chunks)
      }));
      res.writeHead(response.status, Object.fromEntries(response.headers));
      res.end(await response.text());
      return;
    }
    filename = path.resolve(root, '.' + (url === '/' ? '/index.html' : url));
  } catch { res.writeHead(400).end(); return; }
  if (!filename.startsWith(root) || !mime[path.extname(filename)]) { res.writeHead(404).end(); return; }
  try {
    const bytes = await readFile(filename);
    res.writeHead(200, { 'Content-Type': mime[path.extname(filename)], 'Cache-Control': 'no-store' });
    res.end(req.method === 'HEAD' ? undefined : bytes);
  } catch { res.writeHead(404).end('Not found. Run npm run build first.'); }
}).listen(port, '127.0.0.1', () => console.log(`Local: http://127.0.0.1:${port}`));
