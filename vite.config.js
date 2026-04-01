import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

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

      // GET /api/search - buscar parceiros por lat/lon
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

      // GET /api/details?id=UUID - entra na pagina do parceiro e pega telefone + nome
      server.middlewares.use('/api/details', async (req, res) => {
        try {
          const url = new URL(req.url, 'http://localhost');
          const id = url.searchParams.get('id') || '';
          if (!id) {
            res.statusCode = 400;
            res.end(JSON.stringify({ error: 'id obrigatorio' }));
            return;
          }

          // Buscar a pagina HTML do parceiro no Wellhub
          const pageUrl = `https://wellhub.com/pt-br/search/partners/${id}/`;
          const response = await fetch(pageUrl, {
            headers: {
              'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
              'Accept': 'text/html,application/xhtml+xml',
              'Accept-Language': 'pt-BR,pt;q=0.9',
            },
          });
          const html = await response.text();

          // Extrair telefone - padroes: tel:, (XX) XXXXX-XXXX, +55...
          let telefone = '';
          const telMatch = html.match(/href="tel:([^"]+)"/);
          if (telMatch) {
            telefone = telMatch[1].trim();
          } else {
            // Buscar numeros no formato brasileiro
            const phonePatterns = [
              /\(\d{2}\)\s*\d{4,5}[\s-]?\d{4}/,
              /\+55\s*\d{2}\s*\d{4,5}[\s-]?\d{4}/,
              /\d{2}\s*\d{4,5}[\s-]?\d{4}/,
            ];
            for (const pattern of phonePatterns) {
              const m = html.match(pattern);
              if (m) {
                telefone = m[0].trim();
                break;
              }
            }
          }

          // Extrair nome da academia (og:title ou primeiro h1)
          let nome = '';
          const ogTitle = html.match(/<meta[^>]*property="og:title"[^>]*content="([^"]+)"/);
          if (ogTitle) {
            nome = ogTitle[1].trim();
          } else {
            const h1 = html.match(/<h1[^>]*>([^<]+)<\/h1>/);
            if (h1) nome = h1[1].trim();
          }

          // Extrair endereco
          let endereco = '';
          const addrMatch = html.match(/<meta[^>]*property="og:description"[^>]*content="([^"]+)"/);
          if (addrMatch) {
            endereco = addrMatch[1].trim();
          }

          // Extrair avaliacao
          let avaliacao = '';
          const ratingMatch = html.match(/(\d[,\.]\d+)\s*\(\d+\s*Avalia/);
          if (ratingMatch) avaliacao = ratingMatch[1];

          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ id, nome, telefone, endereco, avaliacao }));
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
