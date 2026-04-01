const WELLHUB_TOKEN = 'Bearer 79b04a6d36f4efaac4e8fbfe54398e276a99ac0d9021550e50406be01c99c608';
const WELLHUB_BFF = 'https://mep-partner-bff.wellhub.com';

// Tenta chamar API local primeiro (dev), senão usa proxy CORS (producao)
async function apiFetch(url, signal) {
  // Tentar via /api local (funciona no dev com Vite plugin)
  try {
    const localRes = await fetch(url, { signal });
    if (localRes.ok) return localRes;
  } catch {}

  // Em producao: chamar Wellhub direto via proxy CORS
  const fullUrl = url.startsWith('/api/')
    ? buildWellhubUrl(url)
    : url;

  const proxyUrl = `https://corsproxy.io/?${encodeURIComponent(fullUrl)}`;
  const res = await fetch(proxyUrl, {
    signal,
    headers: {
      'Authorization': WELLHUB_TOKEN,
      'Accept': 'application/json',
    },
  });
  return res;
}

function buildWellhubUrl(localUrl) {
  const url = new URL(localUrl, 'http://localhost');
  const path = url.pathname;
  const params = url.searchParams;

  if (path === '/api/location') {
    return `${WELLHUB_BFF}/v2/search/location?maxResults=8&locale=pt-br&term=${params.get('term') || ''}`;
  }
  if (path === '/api/search') {
    const p = new URLSearchParams({
      lat: params.get('lat') || '-23.5505',
      lon: params.get('lon') || '-46.6333',
      locale: 'pt-br',
      limit: params.get('limit') || '20',
      offset: params.get('offset') || '0',
    });
    if (params.get('term')) p.set('term', params.get('term'));
    return `${WELLHUB_BFF}/v2/search?${p}`;
  }
  return localUrl;
}

export async function buscarCidades(term, signal) {
  const res = await apiFetch(`/api/location?term=${encodeURIComponent(term)}`, signal);
  return res.json();
}

export async function buscarParceiros(lat, lon, limit, offset, term, signal) {
  const params = new URLSearchParams({ lat: String(lat), lon: String(lon), limit: String(limit), offset: String(offset) });
  if (term) params.set('term', term);
  const res = await apiFetch(`/api/search?${params}`, signal);
  return res.json();
}

export async function buscarDetalhes(id, signal) {
  // Detalhes precisa fetch da pagina HTML - tentar via /api/details local
  try {
    const res = await fetch(`/api/details?id=${id}`, { signal });
    if (res.ok) return res.json();
  } catch {}

  // Fallback: buscar via proxy CORS
  try {
    const pageUrl = `https://wellhub.com/pt-br/search/partners/${id}/`;
    const proxyUrl = `https://corsproxy.io/?${encodeURIComponent(pageUrl)}`;
    const res = await fetch(proxyUrl, {
      signal,
      headers: { 'Accept': 'text/html', 'User-Agent': 'Mozilla/5.0' },
    });
    const html = await res.text();

    let telefone = '';
    const telMatch = html.match(/href="tel:([^"]+)"/);
    if (telMatch) telefone = telMatch[1].trim();
    else {
      const m = html.match(/\(\d{2}\)\s*\d{4,5}[\s-]?\d{4}/) || html.match(/\+55\s*\d{2}\s*\d{4,5}[\s-]?\d{4}/);
      if (m) telefone = m[0].trim();
    }

    let nome = '';
    const og = html.match(/<meta[^>]*property="og:title"[^>]*content="([^"]+)"/);
    if (og) nome = og[1].trim();

    let endereco = '';
    const addr = html.match(/<meta[^>]*property="og:description"[^>]*content="([^"]+)"/);
    if (addr) endereco = addr[1].trim();

    return { id, nome, telefone, endereco };
  } catch {
    return { id, nome: '', telefone: '', endereco: '' };
  }
}
