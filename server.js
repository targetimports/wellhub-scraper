import express from 'express';
import { createServer as createViteServer } from 'vite';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { existsSync } from 'fs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 5173;
const isProd = process.env.NODE_ENV === 'production' || existsSync(join(__dirname, 'dist', 'index.html'));

const WELLHUB_TOKEN = 'Bearer 79b04a6d36f4efaac4e8fbfe54398e276a99ac0d9021550e50406be01c99c608';
const WELLHUB_BFF = 'https://mep-partner-bff.wellhub.com';
const WH = {
  'Authorization': WELLHUB_TOKEN,
  'Referer': 'https://wellhub.com/',
  'Origin': 'https://wellhub.com',
  'Accept': 'application/json',
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
};

// ── API: buscar cidade ──
app.get('/api/location', async (req, res) => {
  try {
    const term = req.query.term || '';
    const r = await fetch(`${WELLHUB_BFF}/v2/search/location?maxResults=8&locale=pt-br&term=${encodeURIComponent(term)}`, { headers: WH });
    res.setHeader('Content-Type', 'application/json');
    res.send(await r.text());
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// ── API: buscar parceiros ──
app.get('/api/search', async (req, res) => {
  try {
    const p = new URLSearchParams({
      lat: req.query.lat || '-23.5505', lon: req.query.lon || '-46.6333',
      locale: 'pt-br', limit: req.query.limit || '20', offset: req.query.offset || '0',
    });
    if (req.query.term) p.set('term', req.query.term);
    const r = await fetch(`${WELLHUB_BFF}/v2/search?${p}`, { headers: WH });
    res.setHeader('Content-Type', 'application/json');
    res.send(await r.text());
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// ── API: detalhes (telefone) ──
app.get('/api/details', async (req, res) => {
  try {
    const id = req.query.id || '';
    if (!id) return res.status(400).json({ error: 'id required' });
    const r = await fetch(`https://wellhub.com/pt-br/search/partners/${id}/`, {
      headers: { 'User-Agent': 'Mozilla/5.0', 'Accept': 'text/html', 'Accept-Language': 'pt-BR' },
    });
    const html = await r.text();
    let telefone = '';
    const tel = html.match(/href="tel:([^"]+)"/);
    if (tel) telefone = tel[1].trim();
    else { const m = html.match(/\(\d{2}\)\s*\d{4,5}[\s-]?\d{4}/); if (m) telefone = m[0]; }
    let nome = '';
    const og = html.match(/<meta[^>]*property="og:title"[^>]*content="([^"]+)"/);
    if (og) nome = og[1].trim();
    let endereco = '';
    const ad = html.match(/<meta[^>]*property="og:description"[^>]*content="([^"]+)"/);
    if (ad) endereco = ad[1].trim();
    res.json({ id, nome, telefone, endereco });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// ── Frontend ──
async function start() {
  if (isProd) {
    // Producao: servir arquivos buildados
    app.use(express.static(join(__dirname, 'dist')));
    app.get('*', (req, res) => res.sendFile(join(__dirname, 'dist', 'index.html')));
  } else {
    // Dev: usar Vite como middleware
    const vite = await createViteServer({ server: { middlewareMode: true }, appType: 'spa' });
    app.use(vite.middlewares);
  }

  app.listen(PORT, () => {
    console.log(`Servidor rodando em http://localhost:${PORT}`);
  });
}

start();
