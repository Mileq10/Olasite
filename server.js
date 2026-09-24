// Serwer strony + formularz kontaktowy.
// Nasłuchuje na 0.0.0.0, żeby działał też z telefonu w tej samej sieci Wi-Fi.
// Start: npm start   albo: node server.js

const http = require('http');
const fs = require('fs');
const path = require('path');

const HOST = '0.0.0.0';
const PORT = Number(process.env.PORT) || 8080;
const ROOT = __dirname;
const GALLERY_ROOT = path.join(ROOT, 'zdjecia', 'portfolio');
const INBOX = path.join(ROOT, 'zgloszenia');

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.txt': 'text/plain; charset=utf-8'
};

function send(res, status, body, type) {
  const data = Buffer.isBuffer(body) ? body : Buffer.from(body);
  res.writeHead(status, {
    'Content-Type': type || 'text/plain; charset=utf-8',
    'Content-Length': data.length
  });
  res.end(data);
}

function sendJson(res, status, obj) {
  send(res, status, JSON.stringify(obj), 'application/json; charset=utf-8');
}

function safeJoin(base, rel) {
  const full = path.resolve(base, rel);
  const root = path.resolve(base);
  if (!full.startsWith(root)) return null;
  return full;
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    let size = 0;
    req.on('data', (chunk) => {
      size += chunk.length;
      if (size > 200000) {
        reject(new Error('too large'));
        req.destroy();
        return;
      }
      chunks.push(chunk);
    });
    req.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')));
    req.on('error', reject);
  });
}

function listPhotos(kategoria) {
  const dir = safeJoin(GALLERY_ROOT, kategoria);
  if (!dir || !fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir)
    .filter((name) => /\.(jpe?g|png|webp)$/i.test(name) && !/^okladka\./i.test(name))
    .sort()
    .map((name) => ({
      src: 'zdjecia/portfolio/' + kategoria + '/' + name,
      alt: path.parse(name).name
    }));
}

function serveStatic(urlPath, res) {
  let rel = decodeURIComponent((urlPath.split('?')[0] || '/')).replace(/^\/+/, '');
  if (!rel || rel.endsWith('/')) rel += 'index.html';
  const file = safeJoin(ROOT, rel);
  if (!file || !fs.existsSync(file) || fs.statSync(file).isDirectory()) {
    send(res, 404, 'Not Found');
    return;
  }
  const ext = path.extname(file).toLowerCase();
  send(res, 200, fs.readFileSync(file), MIME[ext] || 'application/octet-stream');
}

const EMAIL_TO = 'obiektywna.szczescie@gmail.com';

async function sendContactEmail(zapis) {
  const lines = [
    'Nowe zapytanie ze strony Obiektyw na Szczęście',
    '',
    'Tematyka: ' + zapis.tematyka,
    'Pakiet: ' + zapis.pakiet,
    'Telefon: ' + (zapis.telefon || 'nie podano'),
    '',
    'Wiadomość:',
    zapis.wiadomosc
  ].join('\n');

  const response = await fetch('https://formsubmit.co/ajax/' + encodeURIComponent(EMAIL_TO), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json'
    },
    body: JSON.stringify({
      _subject: 'Zapytanie ze strony: ' + zapis.tematyka,
      message: lines,
      tematyka: zapis.tematyka,
      pakiet: zapis.pakiet,
      telefon: zapis.telefon || 'nie podano',
      _template: 'box'
    })
  });

  const result = await response.json();
  if (!response.ok || (result.success !== true && result.success !== 'true')) {
    throw new Error(result.message || 'Nie udało się wysłać maila.');
  }
}

fs.mkdirSync(INBOX, { recursive: true });

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, 'http://localhost');

  if (req.method === 'GET' && url.pathname === '/api/galeria') {
    const kategoria = (url.searchParams.get('kategoria') || '').replace(/[^a-z0-9-]/gi, '');
    return sendJson(res, 200, { photos: listPhotos(kategoria) });
  }

  if (req.method === 'POST' && url.pathname === '/api/kontakt') {
    try {
      const data = JSON.parse(await readBody(req));
      const tematyka = String(data.tematyka || '').trim();
      const pakiet = String(data.pakiet || '').trim();
      const wiadomosc = String(data.wiadomosc || '').trim();
      const telefon = String(data.telefon || '').trim();
      const rodo = Boolean(data.rodo);

      if (!tematyka || !pakiet || !wiadomosc || !rodo) {
        return sendJson(res, 400, { ok: false, error: 'Uzupełnij tematykę, pakiet, wiadomość i zgodę RODO.' });
      }

      const zapis = {
        data: new Date().toISOString(),
        tematyka,
        pakiet,
        telefon: telefon || null,
        wiadomosc,
        rodo
      };
      const name = 'zgloszenie-' + zapis.data.replace(/[:.]/g, '-') + '.json';
      fs.writeFileSync(path.join(INBOX, name), JSON.stringify(zapis, null, 2), 'utf8');
      await sendContactEmail(zapis);
      return sendJson(res, 200, { ok: true });
    } catch (err) {
      console.error(err);
      return sendJson(res, 400, { ok: false, error: err.message || 'Nie udało się wysłać formularza.' });
    }
  }

  if (req.method === 'GET' || req.method === 'HEAD') {
    return serveStatic(url.pathname, res);
  }

  send(res, 405, 'Method Not Allowed');
});

server.listen(PORT, HOST, () => {
  console.log('Serwer nasłuchuje na http://' + HOST + ':' + PORT);
  console.log('Ten komputer: http://127.0.0.1:' + PORT + '/');
  console.log('Maile z formularza idą na: ' + EMAIL_TO);
});
