import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Plugin que adiciona rotas de API direto no Vite dev server
function apiPlugin() {
  return {
    name: 'api-proxy',
    configureServer(server) {
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

      // GET /api/search
      server.middlewares.use('/api/search', async (req, res) => {
        try {
          const url = new URL(req.url, 'http://localhost');
          const params = new URLSearchParams({
            lat: url.searchParams.get('lat') || '-23.5505',
            lon: url.searchParams.get('lon') || '-46.6333',
            locale: 'pt-br',
            limit: url.searchParams.get('limit') || '20',
            offset: url.searchParams.get('offset') || '0',
          });
          const term = url.searchParams.get('term');
          if (term) params.set('term', term);

          const response = await fetch(`${WELLHUB_BFF}/v2/search?${params}`, { headers: HEADERS });
          const data = await response.text();
          res.setHeader('Content-Type', 'application/json');
          res.end(data);
        } catch (e) {
          res.statusCode = 500;
          res.end(JSON.stringify({ error: e.message }));
        }
      });

      // GET /api/location
      server.middlewares.use('/api/location', async (req, res) => {
        try {
          const url = new URL(req.url, 'http://localhost');
          const term = url.searchParams.get('term') || '';
          const response = await fetch(
            `${WELLHUB_BFF}/v2/search/location?maxResults=6&locale=pt-br&term=${encodeURIComponent(term)}`,
            { headers: HEADERS }
          );
          const data = await response.text();
          res.setHeader('Content-Type', 'application/json');
          res.end(data);
        } catch (e) {
          res.statusCode = 500;
          res.end(JSON.stringify({ error: e.message }));
        }
      });

      // GET /api/partner/:id
      server.middlewares.use('/api/partner', async (req, res) => {
        try {
          const url = new URL(req.url, 'http://localhost');
          const id = url.searchParams.get('id') || '';
          const response = await fetch(
            `${WELLHUB_BFF}/v2/search/partner/${id}?locale=pt-br`,
            { headers: HEADERS }
          );
          const data = await response.text();
          res.setHeader('Content-Type', 'application/json');
          res.end(data);
        } catch (e) {
          res.statusCode = 500;
          res.end(JSON.stringify({ error: e.message }));
        }
      });
    },
  };
}

export default defineConfig({
  plugins: [apiPlugin(), react()],
});
