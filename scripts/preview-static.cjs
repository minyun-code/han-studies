'use strict';

const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '../frontend/out');
const port = Number(process.env.PORT || 3001);
const mimeTypes = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.txt': 'text/plain; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.webp': 'image/webp',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.otf': 'font/otf',
  '.pdf': 'application/pdf',
  '.mp4': 'video/mp4',
  '.mp3': 'audio/mpeg',
  '.zip': 'application/zip',
};

if (!Number.isInteger(port) || port < 1 || port > 65535) {
  console.error('Invalid PORT. Expected an integer between 1 and 65535.');
  process.exit(1);
}

if (!fs.existsSync(path.join(root, 'index.html'))) {
  console.error('frontend/out/index.html is missing. Run npm run build:frontend first.');
  process.exit(1);
}

const server = http.createServer(async (req, res) => {
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    res.writeHead(405, { Allow: 'GET, HEAD' });
    res.end('Method Not Allowed');
    return;
  }

  let pathname;
  try {
    pathname = decodeURIComponent((req.url || '/').split('?')[0]);
  } catch {
    res.writeHead(400);
    res.end('Bad Request');
    return;
  }

  const filePath = path.resolve(root, `.${pathname}`);
  const relative = path.relative(root, filePath);
  if (relative.startsWith('..') || path.isAbsolute(relative) || filePath.includes('\0')) {
    res.writeHead(403);
    res.end('Forbidden');
    return;
  }

  const candidates = pathname.endsWith('/')
    ? [path.join(filePath, 'index.html')]
    : path.extname(filePath)
      ? [filePath]
      : [`${filePath}.html`, path.join(filePath, 'index.html')];

  for (const candidate of candidates) {
    try {
      const stats = await fs.promises.stat(candidate);
      if (!stats.isFile()) continue;
      res.writeHead(200, {
        'Content-Type': mimeTypes[path.extname(candidate).toLowerCase()] || 'application/octet-stream',
        'Content-Length': stats.size,
        'Cache-Control': 'no-store',
      });
      if (req.method === 'HEAD') {
        res.end();
      } else {
        const stream = fs.createReadStream(candidate);
        stream.on('error', () => res.destroy());
        stream.pipe(res);
      }
      return;
    } catch {
      // Try the next static route form.
    }
  }

  res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
  res.end('Not Found');
});

server.on('error', (error) => {
  console.error(error.message);
  process.exitCode = 1;
});

server.listen(port, '127.0.0.1', () => {
  console.log(`Static preview: http://127.0.0.1:${port}`);
  console.log('Serving frontend/out. Press Ctrl+C to stop.');
});
