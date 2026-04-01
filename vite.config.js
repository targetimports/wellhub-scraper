import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

function apiPlugin() {
  return {
    name: 'api-proxy',
    configureServer(server) {
      const WELLHUB_TOKEN = 'Bearer 79b04a6d36f4efaac4e8fbfe54398e276a99ac0d9021550e50406be01c99c608';
      const HEADERS = {
        'Authorization': WELLHUB_TOKEN,
        'Referer': 'https://wellhub.com/',
        'Origin': 'https://wellhub.com',
        'Accept': '*/*',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      };

      // Proxy generico - recebe qualquer URL e faz fetch server-side
      server.middlewares.use('/api/proxy', async (req, res) => {
        try {
          const reqUrl = new URL(req.url, 'http://localhost');
          const targetUrl = reqUrl.searchParams.get('url');
          if (!targetUrl) { res.statusCode = 400; res.end('{"error":"url required"}'); return; }

          const response = await fetch(targetUrl, { headers: HEADERS });
          const body = await response.text();
          const ct = response.headers.get('content-type') || 'text/plain';
          res.setHeader('Content-Type', ct);
          res.setHeader('Access-Control-Allow-Origin', '*');
          res.end(body);
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
