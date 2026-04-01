import express from 'express';
import cors from 'cors';

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

// Token publico do Wellhub (embutido no frontend deles)
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

// Buscar localizacao por nome da cidade
app.get('/api/location', async (req, res) => {
  const { term } = req.query;
  if (!term) return res.status(400).json({ error: 'Parametro "term" obrigatorio' });

  try {
    const url = `${WELLHUB_BFF}/v2/search/location?maxResults=6&locale=pt-br&term=${encodeURIComponent(term)}`;
    const response = await fetch(url, { headers: HEADERS });
    const data = await response.json();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Buscar parceiros por coordenadas
app.get('/api/search', async (req, res) => {
  const { lat, lon, limit = '20', offset = '0', term = '' } = req.query;
  if (!lat || !lon) return res.status(400).json({ error: 'Parametros "lat" e "lon" obrigatorios' });

  try {
    const params = new URLSearchParams({
      lat, lon, locale: 'pt-br',
      limit: String(limit),
      offset: String(offset),
    });
    if (term) params.set('term', term);

    const url = `${WELLHUB_BFF}/v2/search?${params}`;
    const response = await fetch(url, { headers: HEADERS });
    const data = await response.json();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Buscar atividades disponiveis
app.get('/api/activities', async (_req, res) => {
  try {
    const url = `${WELLHUB_BFF}/v2/search/activities?allQuantity=100&popularQuantity=11&locale=pt-br&entityType=all`;
    const response = await fetch(url, { headers: HEADERS });
    const data = await response.json();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`  API proxy rodando em http://localhost:${PORT}`);
});
