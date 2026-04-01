const TOKEN = 'Bearer 79b04a6d36f4efaac4e8fbfe54398e276a99ac0d9021550e50406be01c99c608';
const BFF = 'https://mep-partner-bff.wellhub.com';
const HDRS = {
  'Authorization': TOKEN,
  'Referer': 'https://wellhub.com/',
  'Origin': 'https://wellhub.com',
  'Accept': 'application/json',
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
};

// Tenta /api local, se falhar tenta direto, se CORS bloquear tenta proxies
async function smartFetch(localUrl, directUrl, signal, isJson = true) {
  // 1) Tentar rota local /api (funciona se Vite plugin estiver ativo)
  try {
    const res = await fetch(localUrl, { signal });
    if (res.ok) {
      const text = await res.text();
      if (isJson && text.startsWith('<')) throw new Error('got html');
      return isJson ? JSON.parse(text) : text;
    }
  } catch (e) {
    if (e.name === 'AbortError') throw e;
  }

  // 2) Tentar chamada direta (funciona de Node.js ou se CORS permitir)
  try {
    const res = await fetch(directUrl, { signal, headers: HDRS });
    if (res.ok) {
      const text = await res.text();
      if (isJson && text.startsWith('<')) throw new Error('got html');
      return isJson ? JSON.parse(text) : text;
    }
  } catch (e) {
    if (e.name === 'AbortError') throw e;
  }

  // 3) Tentar via proxy CORS
  const proxies = [
    `https://api.allorigins.win/raw?url=${encodeURIComponent(directUrl)}`,
    `https://corsproxy.io/?${encodeURIComponent(directUrl)}`,
  ];
  for (const proxy of proxies) {
    try {
      const res = await fetch(proxy, { signal });
      if (res.ok) {
        const text = await res.text();
        if (isJson && text.startsWith('<')) continue;
        return isJson ? JSON.parse(text) : text;
      }
    } catch (e) {
      if (e.name === 'AbortError') throw e;
    }
  }

  throw new Error('API indisponivel - tente novamente');
}

// Bounding box de cada estado
const ESTADOS_BBOX = {
  "AC": { latMin: -11.15, latMax: -7.11, lonMin: -73.99, lonMax: -66.62 },
  "AL": { latMin: -10.50, latMax: -8.81, lonMin: -37.94, lonMax: -35.15 },
  "AP": { latMin: -1.23, latMax: 4.44, lonMin: -54.87, lonMax: -49.87 },
  "AM": { latMin: -9.82, latMax: 2.25, lonMin: -73.79, lonMax: -56.10 },
  "BA": { latMin: -18.35, latMax: -8.53, lonMin: -46.62, lonMax: -37.34 },
  "CE": { latMin: -7.86, latMax: -2.78, lonMin: -41.42, lonMax: -37.25 },
  "DF": { latMin: -16.05, latMax: -15.50, lonMin: -48.29, lonMax: -47.31 },
  "ES": { latMin: -21.30, latMax: -17.89, lonMin: -41.88, lonMax: -39.68 },
  "GO": { latMin: -19.50, latMax: -12.39, lonMin: -53.25, lonMax: -45.91 },
  "MA": { latMin: -10.26, latMax: -1.05, lonMin: -48.76, lonMax: -41.80 },
  "MT": { latMin: -18.04, latMax: -7.35, lonMin: -61.63, lonMax: -50.22 },
  "MS": { latMin: -24.07, latMax: -17.17, lonMin: -57.65, lonMax: -50.93 },
  "MG": { latMin: -22.92, latMax: -14.23, lonMin: -51.05, lonMax: -39.86 },
  "PA": { latMin: -9.84, latMax: 2.59, lonMin: -58.90, lonMax: -46.06 },
  "PB": { latMin: -8.30, latMax: -6.02, lonMin: -38.77, lonMax: -34.79 },
  "PR": { latMin: -26.72, latMax: -22.51, lonMin: -54.62, lonMax: -48.02 },
  "PE": { latMin: -9.48, latMax: -7.33, lonMin: -41.36, lonMax: -34.86 },
  "PI": { latMin: -10.93, latMax: -2.74, lonMin: -45.99, lonMax: -40.37 },
  "RJ": { latMin: -23.37, latMax: -20.76, lonMin: -44.89, lonMax: -40.96 },
  "RN": { latMin: -6.98, latMax: -4.83, lonMin: -37.26, lonMax: -34.95 },
  "RS": { latMin: -33.75, latMax: -27.08, lonMin: -57.64, lonMax: -49.69 },
  "RO": { latMin: -13.69, latMax: -7.97, lonMin: -66.62, lonMax: -59.77 },
  "RR": { latMin: -1.59, latMax: 5.27, lonMin: -64.83, lonMax: -58.88 },
  "SC": { latMin: -29.39, latMax: -25.95, lonMin: -53.84, lonMax: -48.55 },
  "SP": { latMin: -25.31, latMax: -19.78, lonMin: -53.11, lonMax: -44.16 },
  "SE": { latMin: -11.57, latMax: -9.51, lonMin: -37.98, lonMax: -36.39 },
  "TO": { latMin: -13.47, latMax: -5.17, lonMin: -50.73, lonMax: -45.73 },
};

const CIDADES_DB = {
  "sao paulo": { lat: -23.5505, lon: -46.6333 },
  "rio de janeiro": { lat: -22.9068, lon: -43.1729 },
  "belo horizonte": { lat: -19.9167, lon: -43.9345 },
  "curitiba": { lat: -25.4284, lon: -49.2733 },
  "porto alegre": { lat: -30.0346, lon: -51.2177 },
  "brasilia": { lat: -15.7975, lon: -47.8919 },
  "salvador": { lat: -12.9714, lon: -38.5124 },
  "fortaleza": { lat: -3.7172, lon: -38.5433 },
  "recife": { lat: -8.0476, lon: -34.877 },
  "goiania": { lat: -16.6869, lon: -49.2648 },
  "manaus": { lat: -3.119, lon: -60.0217 },
  "campinas": { lat: -22.9099, lon: -47.0626 },
  "florianopolis": { lat: -27.5954, lon: -48.548 },
  "vitoria": { lat: -20.3155, lon: -40.3128 },
  "natal": { lat: -5.7945, lon: -35.211 },
  "belem": { lat: -1.4558, lon: -48.5024 },
  "santos": { lat: -23.9608, lon: -46.3336 },
  "feira de santana": { lat: -12.2545, lon: -38.9543 },
  "vitoria da conquista": { lat: -14.8619, lon: -40.8444 },
  "ilheus": { lat: -14.7936, lon: -39.0464 },
  "aracaju": { lat: -10.9111, lon: -37.0717 },
  "maceio": { lat: -9.6658, lon: -35.7353 },
  "joao pessoa": { lat: -7.1195, lon: -34.845 },
  "teresina": { lat: -5.0892, lon: -42.8019 },
  "sao luis": { lat: -2.5297, lon: -44.2825 },
  "cuiaba": { lat: -15.6014, lon: -56.0979 },
  "campo grande": { lat: -20.4697, lon: -54.6201 },
  "palmas": { lat: -10.1689, lon: -48.3317 },
  "porto velho": { lat: -8.7612, lon: -63.9004 },
  "rio branco": { lat: -9.9753, lon: -67.81 },
  "macapa": { lat: 0.0349, lon: -51.0694 },
  "boa vista": { lat: 2.8195, lon: -60.6714 },
  "londrina": { lat: -23.3045, lon: -51.1696 },
  "maringa": { lat: -23.4205, lon: -51.9333 },
  "joinville": { lat: -26.3045, lon: -48.8487 },
  "blumenau": { lat: -26.9194, lon: -49.0661 },
  "ribeirao preto": { lat: -21.1704, lon: -47.8103 },
  "uberlandia": { lat: -18.9186, lon: -48.2772 },
  "sorocaba": { lat: -23.5015, lon: -47.4526 },
  "niteroi": { lat: -22.8833, lon: -43.1036 },
  "juiz de fora": { lat: -21.7642, lon: -43.3503 },
  "caxias do sul": { lat: -29.1681, lon: -51.1794 },
  "cascavel": { lat: -24.9573, lon: -53.4593 },
  "petropolis": { lat: -22.5046, lon: -43.1787 },
  "caruaru": { lat: -8.2823, lon: -35.9761 },
  "petrolina": { lat: -9.3891, lon: -40.5003 },
  "chapeco": { lat: -27.1006, lon: -52.6155 },
  "bauru": { lat: -22.3246, lon: -49.0871 },
  "franca": { lat: -20.539, lon: -47.4008 },
  "montes claros": { lat: -16.735, lon: -43.8615 },
  "campina grande": { lat: -7.2307, lon: -35.8817 },
  "sobral": { lat: -3.6861, lon: -40.3482 },
  "mossoró": { lat: -5.1878, lon: -37.3441 },
  "presidente prudente": { lat: -22.1256, lon: -51.3889 },
  "sao jose do rio preto": { lat: -20.8113, lon: -49.3758 },
  "anapolis": { lat: -16.3281, lon: -48.9529 },
  "dourados": { lat: -22.2233, lon: -54.8083 },
  "sinop": { lat: -11.8642, lon: -55.5066 },
  "imperatriz": { lat: -5.519, lon: -47.4735 },
  "maraba": { lat: -5.3685, lon: -49.1178 },
  "santarem": { lat: -2.443, lon: -54.708 },
  "volta redonda": { lat: -22.5023, lon: -44.1044 },
  "campos dos goytacazes": { lat: -21.7523, lon: -41.3305 },
  "cabo frio": { lat: -22.8789, lon: -42.0189 },
  "santa maria": { lat: -29.6842, lon: -53.8069 },
  "passo fundo": { lat: -28.2624, lon: -52.4068 },
  "foz do iguacu": { lat: -25.5163, lon: -54.5854 },
};

function normalize(str) {
  return str.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z\s]/g, '').trim();
}

function gerarGrade(uf) {
  const bbox = ESTADOS_BBOX[uf];
  if (!bbox) return [];
  const STEP = 0.45;
  const pontos = [];
  for (let lat = bbox.latMin; lat <= bbox.latMax; lat += STEP) {
    for (let lon = bbox.lonMin; lon <= bbox.lonMax; lon += STEP) {
      pontos.push({ lat: Math.round(lat * 10000) / 10000, lon: Math.round(lon * 10000) / 10000 });
    }
  }
  return pontos;
}

export function resolverBusca(texto) {
  const upper = texto.trim().toUpperCase();
  if (ESTADOS_BBOX[upper]) return { tipo: 'estado', pontos: gerarGrade(upper) };
  if (upper === 'TODOS') {
    const pontos = [];
    for (const uf of Object.keys(ESTADOS_BBOX)) pontos.push(...gerarGrade(uf));
    return { tipo: 'brasil', pontos };
  }
  const norm = normalize(texto);
  for (const [key, coords] of Object.entries(CIDADES_DB)) {
    if (key === norm || key.includes(norm) || norm.includes(key)) {
      return { tipo: 'cidade', pontos: [coords] };
    }
  }
  return null;
}

export function listarEstados() { return Object.keys(ESTADOS_BBOX).sort(); }

export async function buscarParceiros(lat, lon, limit, offset, term, signal) {
  const p = new URLSearchParams({
    lat: String(lat), lon: String(lon), locale: 'pt-br',
    limit: String(limit), offset: String(offset),
  });
  if (term) p.set('term', term);
  return smartFetch(
    `/api/search?${p}`,
    `${BFF}/v2/search?${p}`,
    signal, true
  );
}

export async function buscarDetalhes(id, signal) {
  try {
    return await smartFetch(
      `/api/details?id=${id}`,
      `https://wellhub.com/pt-br/search/partners/${id}/`,
      signal, true
    );
  } catch {
    // Se smartFetch retornar HTML (pagina do parceiro), parsear aqui
    try {
      const html = await smartFetch(
        `/api/details?id=${id}`,
        `https://wellhub.com/pt-br/search/partners/${id}/`,
        signal, false
      );
      let telefone = '';
      const tel = html.match(/href="tel:([^"]+)"/);
      if (tel) telefone = tel[1].trim();
      let nome = '';
      const og = html.match(/<meta[^>]*property="og:title"[^>]*content="([^"]+)"/);
      if (og) nome = og[1].trim();
      return { id, nome, telefone, endereco: '' };
    } catch {
      return { id, nome: '', telefone: '', endereco: '' };
    }
  }
}
