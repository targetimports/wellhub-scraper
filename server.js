import express from 'express';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 3000;

// ── API Config ──
const WELLHUB_TOKEN = 'Bearer 79b04a6d36f4efaac4e8fbfe54398e276a99ac0d9021550e50406be01c99c608';
const WELLHUB_BFF = 'https://mep-partner-bff.wellhub.com';
const HEADERS = {
  'Authorization': WELLHUB_TOKEN,
  'Referer': 'https://wellhub.com/',
  'Origin': 'https://wellhub.com',
  'Accept': 'application/json',
  'Content-Type': 'application/json',
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
};

// ── API Routes ──

// Buscar cidade pelo nome
app.get('/api/location', async (req, res) => {
  try {
    const term = req.query.term || '';
    const response = await fetch(
      `${WELLHUB_BFF}/v2/search/location?maxResults=8&locale=pt-br&term=${encodeURIComponent(term)}`,
      { headers: HEADERS }
    );
    const data = await response.text();
    res.setHeader('Content-Type', 'application/json');
    res.send(data);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Buscar parceiros por lat/lon
app.get('/api/search', async (req, res) => {
  try {
    const params = new URLSearchParams({
      lat: req.query.lat || '-23.5505',
      lon: req.query.lon || '-46.6333',
      locale: 'pt-br',
      limit: req.query.limit || '20',
      offset: req.query.offset || '0',
    });
    if (req.query.term) params.set('term', req.query.term);

    const response = await fetch(`${WELLHUB_BFF}/v2/search?${params}`, { headers: HEADERS });
    const data = await response.text();
    res.setHeader('Content-Type', 'application/json');
    res.send(data);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Entrar na pagina do parceiro e pegar telefone + nome
app.get('/api/details', async (req, res) => {
  try {
    const id = req.query.id || '';
    if (!id) return res.status(400).json({ error: 'id obrigatorio' });

    const pageUrl = `https://wellhub.com/pt-br/search/partners/${id}/`;
    const response = await fetch(pageUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'text/html,application/xhtml+xml',
        'Accept-Language': 'pt-BR,pt;q=0.9',
      },
    });
    const html = await response.text();

    let telefone = '';
    const telMatch = html.match(/href="tel:([^"]+)"/);
    if (telMatch) {
      telefone = telMatch[1].trim();
    } else {
      const phonePatterns = [/\(\d{2}\)\s*\d{4,5}[\s-]?\d{4}/, /\+55\s*\d{2}\s*\d{4,5}[\s-]?\d{4}/];
      for (const pattern of phonePatterns) {
        const m = html.match(pattern);
        if (m) { telefone = m[0].trim(); break; }
      }
    }

    let nome = '';
    const ogTitle = html.match(/<meta[^>]*property="og:title"[^>]*content="([^"]+)"/);
    if (ogTitle) nome = ogTitle[1].trim();

    let endereco = '';
    const addrMatch = html.match(/<meta[^>]*property="og:description"[^>]*content="([^"]+)"/);
    if (addrMatch) endereco = addrMatch[1].trim();

    res.json({ id, nome, telefone, endereco });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// ── Servir frontend (arquivos buildados) ──
app.use(express.static(join(__dirname, 'dist')));
app.get('*', (req, res) => {
  res.sendFile(join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});
