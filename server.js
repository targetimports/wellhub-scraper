import express from 'express';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 3000;

const WELLHUB_TOKEN = 'Bearer 79b04a6d36f4efaac4e8fbfe54398e276a99ac0d9021550e50406be01c99c608';
const HEADERS = {
  'Authorization': WELLHUB_TOKEN,
  'Referer': 'https://wellhub.com/',
  'Origin': 'https://wellhub.com',
  'Accept': '*/*',
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
};

// Proxy generico - recebe URL e faz fetch server-side
app.get('/api/proxy', async (req, res) => {
  try {
    const targetUrl = req.query.url;
    if (!targetUrl) return res.status(400).json({ error: 'url required' });

    const response = await fetch(targetUrl, { headers: HEADERS });
    const body = await response.text();
    const ct = response.headers.get('content-type') || 'text/plain';
    res.setHeader('Content-Type', ct);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.send(body);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Servir frontend
app.use(express.static(join(__dirname, 'dist')));
app.get('*', (req, res) => res.sendFile(join(__dirname, 'dist', 'index.html')));

app.listen(PORT, () => console.log(`http://localhost:${PORT}`));
