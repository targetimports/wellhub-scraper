const WELLHUB_TOKEN = 'Bearer 79b04a6d36f4efaac4e8fbfe54398e276a99ac0d9021550e50406be01c99c608';
const WELLHUB_BFF = 'https://mep-partner-bff.wellhub.com';

const PROXIES = [
  (url) => `/api/proxy?url=${encodeURIComponent(url)}`,  // local (dev)
  (url) => `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`,
  (url) => `https://corsproxy.io/?${encodeURIComponent(url)}`,
  (url) => `https://api.codetabs.com/v1/proxy?quest=${encodeURIComponent(url)}`,
];

async function fetchWithProxy(url, signal, isJson = true) {
  for (const makeProxy of PROXIES) {
    try {
      const proxyUrl = makeProxy(url);
      const res = await fetch(proxyUrl, {
        signal,
        headers: {
          'Authorization': WELLHUB_TOKEN,
          'Accept': isJson ? 'application/json' : 'text/html',
        },
      });
      if (!res.ok) continue;
      const text = await res.text();
      // Verificar se retornou HTML de erro ao inves de JSON
      if (isJson && text.startsWith('<')) continue;
      return isJson ? JSON.parse(text) : text;
    } catch (e) {
      if (e.name === 'AbortError') throw e;
      continue; // tentar proximo proxy
    }
  }
  throw new Error('Todos os proxies falharam');
}

export async function buscarCidades(term, signal) {
  const url = `${WELLHUB_BFF}/v2/search/location?maxResults=8&locale=pt-br&term=${encodeURIComponent(term)}`;
  return fetchWithProxy(url, signal, true);
}

export async function buscarParceiros(lat, lon, limit, offset, term, signal) {
  const params = new URLSearchParams({
    lat: String(lat), lon: String(lon), locale: 'pt-br',
    limit: String(limit), offset: String(offset),
  });
  if (term) params.set('term', term);
  const url = `${WELLHUB_BFF}/v2/search?${params}`;
  return fetchWithProxy(url, signal, true);
}

export async function buscarDetalhes(id, signal) {
  const pageUrl = `https://wellhub.com/pt-br/search/partners/${id}/`;
  try {
    const html = await fetchWithProxy(pageUrl, signal, false);

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
