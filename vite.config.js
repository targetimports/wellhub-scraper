import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

function apiPlugin() {
  return {
    name: 'wellhub-api',
    configureServer(server) {
      const TOKEN = 'Bearer 79b04a6d36f4efaac4e8fbfe54398e276a99ac0d9021550e50406be01c99c608';
      const BFF = 'https://mep-partner-bff.wellhub.com';
      const H = {
        'Authorization': TOKEN,
        'Referer': 'https://wellhub.com/',
        'Origin': 'https://wellhub.com',
        'Accept': 'application/json',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      };

      server.middlewares.use(async (req, res, next) => {
        const url = new URL(req.url, 'http://localhost');

        if (url.pathname === '/api/search') {
          try {
            const p = new URLSearchParams({
              lat: url.searchParams.get('lat') || '-23.5505',
              lon: url.searchParams.get('lon') || '-46.6333',
              locale: 'pt-br',
              limit: url.searchParams.get('limit') || '20',
              offset: url.searchParams.get('offset') || '0',
            });
            if (url.searchParams.get('term')) p.set('term', url.searchParams.get('term'));
            const r = await fetch(`${BFF}/v2/search?${p}`, { headers: H });
            const body = await r.text();
            res.setHeader('Content-Type', 'application/json');
            res.end(body);
          } catch (e) {
            res.statusCode = 500;
            res.end(JSON.stringify({ error: e.message }));
          }
          return;
        }

        if (url.pathname === '/api/details') {
          try {
            const id = url.searchParams.get('id') || '';
            if (!id) { res.statusCode = 400; res.end('{"error":"id required"}'); return; }
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
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ id, nome, telefone, endereco }));
          } catch (e) {
            res.statusCode = 500;
            res.end(JSON.stringify({ error: e.message }));
          }
          return;
        }

        next();
      });
    },
  };
}

export default defineConfig({
  plugins: [apiPlugin(), react()],
});
