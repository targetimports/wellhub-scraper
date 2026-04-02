const TOKEN = 'Bearer 79b04a6d36f4efaac4e8fbfe54398e276a99ac0d9021550e50406be01c99c608';
const BFF = 'https://mep-partner-bff.wellhub.com';
const HDRS = {
  'Authorization': TOKEN, 'Referer': 'https://wellhub.com/',
  'Origin': 'https://wellhub.com', 'Accept': 'application/json',
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
};

async function smartFetch(localUrl, directUrl, signal, isJson = true) {
  // Tentar local primeiro
  try {
    const res = await fetch(localUrl, { signal });
    if (res.ok) {
      const text = await res.text();
      if (isJson && text.startsWith('<')) throw new Error('html');
      return isJson ? JSON.parse(text) : text;
    }
  } catch (e) { if (e.name === 'AbortError') throw e; }
  // Direto
  try {
    const res = await fetch(directUrl, { signal, headers: HDRS });
    if (res.ok) {
      const text = await res.text();
      if (isJson && text.startsWith('<')) throw new Error('html');
      return isJson ? JSON.parse(text) : text;
    }
  } catch (e) { if (e.name === 'AbortError') throw e; }
  // Proxies
  for (const px of [
    `https://api.allorigins.win/raw?url=${encodeURIComponent(directUrl)}`,
    `https://corsproxy.io/?${encodeURIComponent(directUrl)}`,
  ]) {
    try {
      const res = await fetch(px, { signal });
      if (res.ok) {
        const text = await res.text();
        if (isJson && text.startsWith('<')) continue;
        return isJson ? JSON.parse(text) : text;
      }
    } catch (e) { if (e.name === 'AbortError') throw e; }
  }
  throw new Error('API indisponivel');
}

// Bounding box dos estados
const BBOX = {
  "AC": [-11.15,-7.11,-73.99,-66.62], "AL": [-10.50,-8.81,-37.94,-35.15],
  "AP": [-1.23,4.44,-54.87,-49.87], "AM": [-9.82,2.25,-73.79,-56.10],
  "BA": [-18.35,-8.53,-46.62,-37.34], "CE": [-7.86,-2.78,-41.42,-37.25],
  "DF": [-16.05,-15.50,-48.29,-47.31], "ES": [-21.30,-17.89,-41.88,-39.68],
  "GO": [-19.50,-12.39,-53.25,-45.91], "MA": [-10.26,-1.05,-48.76,-41.80],
  "MT": [-18.04,-7.35,-61.63,-50.22], "MS": [-24.07,-17.17,-57.65,-50.93],
  "MG": [-22.92,-14.23,-51.05,-39.86], "PA": [-9.84,2.59,-58.90,-46.06],
  "PB": [-8.30,-6.02,-38.77,-34.79], "PR": [-26.72,-22.51,-54.62,-48.02],
  "PE": [-9.48,-7.33,-41.36,-34.86], "PI": [-10.93,-2.74,-45.99,-40.37],
  "RJ": [-23.37,-20.76,-44.89,-40.96], "RN": [-6.98,-4.83,-37.26,-34.95],
  "RS": [-33.75,-27.08,-57.64,-49.69], "RO": [-13.69,-7.97,-66.62,-59.77],
  "RR": [-1.59,5.27,-64.83,-58.88], "SC": [-29.39,-25.95,-53.84,-48.55],
  "SP": [-25.31,-19.78,-53.11,-44.16], "SE": [-11.57,-9.51,-37.98,-36.39],
  "TO": [-13.47,-5.17,-50.73,-45.73],
};

// Cidades para busca individual
const CIDADES = {
  "sao paulo":[-23.5505,-46.6333],"rio de janeiro":[-22.9068,-43.1729],
  "belo horizonte":[-19.9167,-43.9345],"curitiba":[-25.4284,-49.2733],
  "porto alegre":[-30.0346,-51.2177],"brasilia":[-15.7975,-47.8919],
  "salvador":[-12.9714,-38.5124],"fortaleza":[-3.7172,-38.5433],
  "recife":[-8.0476,-34.877],"goiania":[-16.6869,-49.2648],
  "manaus":[-3.119,-60.0217],"campinas":[-22.9099,-47.0626],
  "florianopolis":[-27.5954,-48.548],"vitoria":[-20.3155,-40.3128],
  "natal":[-5.7945,-35.211],"belem":[-1.4558,-48.5024],
  "santos":[-23.9608,-46.3336],"feira de santana":[-12.2545,-38.9543],
  "vitoria da conquista":[-14.8619,-40.8444],"aracaju":[-10.9111,-37.0717],
  "maceio":[-9.6658,-35.7353],"joao pessoa":[-7.1195,-34.845],
  "teresina":[-5.0892,-42.8019],"sao luis":[-2.5297,-44.2825],
  "cuiaba":[-15.6014,-56.0979],"campo grande":[-20.4697,-54.6201],
  "palmas":[-10.1689,-48.3317],"porto velho":[-8.7612,-63.9004],
  "londrina":[-23.3045,-51.1696],"maringa":[-23.4205,-51.9333],
  "joinville":[-26.3045,-48.8487],"blumenau":[-26.9194,-49.0661],
  "ribeirao preto":[-21.1704,-47.8103],"uberlandia":[-18.9186,-48.2772],
  "caxias do sul":[-29.1681,-51.1794],"cascavel":[-24.9573,-53.4593],
  "petropolis":[-22.5046,-43.1787],"caruaru":[-8.2823,-35.9761],
  "bauru":[-22.3246,-49.0871],"montes claros":[-16.735,-43.8615],
  "campina grande":[-7.2307,-35.8817],"sobral":[-3.6861,-40.3482],
  "ilheus":[-14.7936,-39.0464],"dourados":[-22.2233,-54.8083],
  "chapeco":[-27.1006,-52.6155],"niteroi":[-22.8833,-43.1036],
  "juiz de fora":[-21.7642,-43.3503],"sorocaba":[-23.5015,-47.4526],
};

function normalize(s) { return s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z\s]/g,'').trim(); }

// Grade DENSA: 0.18 graus ≈ 20km entre pontos
function gerarGrade(uf) {
  const b = BBOX[uf];
  if (!b) return [];
  const STEP = 0.18; // ~20km - cobertura total
  const pontos = [];
  for (let lat = b[0]; lat <= b[1]; lat += STEP)
    for (let lon = b[2]; lon <= b[3]; lon += STEP)
      pontos.push({ lat: Math.round(lat*1e4)/1e4, lon: Math.round(lon*1e4)/1e4 });
  return pontos;
}

export function resolverBusca(texto) {
  const up = texto.trim().toUpperCase();
  if (BBOX[up]) return { tipo:'estado', uf:up, pontos: gerarGrade(up) };
  if (up === 'TODOS') {
    const p = []; for (const uf of Object.keys(BBOX)) p.push(...gerarGrade(uf));
    return { tipo:'brasil', uf:'BR', pontos: p };
  }
  const n = normalize(texto);
  for (const [k,v] of Object.entries(CIDADES)) {
    if (k===n || k.includes(n) || n.includes(k)) return { tipo:'cidade', uf:'', pontos:[{lat:v[0],lon:v[1]}] };
  }
  return null;
}

export function listarEstados() { return Object.keys(BBOX).sort(); }

export async function buscarParceiros(lat, lon, limit, offset, term, signal) {
  const p = new URLSearchParams({ lat:String(lat), lon:String(lon), locale:'pt-br', limit:String(limit), offset:String(offset) });
  if (term) p.set('term', term);
  return smartFetch(`/api/search?${p}`, `${BFF}/v2/search?${p}`, signal, true);
}

export async function buscarDetalhes(id, signal) {
  try {
    return await smartFetch(`/api/details?id=${id}`, `https://wellhub.com/pt-br/search/partners/${id}/`, signal, true);
  } catch {
    try {
      const html = await smartFetch(`/api/details?id=${id}`, `https://wellhub.com/pt-br/search/partners/${id}/`, signal, false);
      let tel=''; const t=html.match(/href="tel:([^"]+)"/); if(t) tel=t[1].trim();
      let nome=''; const o=html.match(/<meta[^>]*property="og:title"[^>]*content="([^"]+)"/); if(o) nome=o[1].trim();
      return { id, nome, telefone:tel, endereco:'' };
    } catch { return { id, nome:'', telefone:'', endereco:'' }; }
  }
}

// Salvar no Supabase
export async function salvarNoSupabase(supabaseUrl, supabaseKey, resultados, estado) {
  const rows = resultados.map(r => ({
    wellhub_id: r.id,
    nome: r.nome,
    telefone: r.telefone || '',
    endereco: r.endereco || '',
    estado: estado,
    link: `https://wellhub.com/pt-br/search/partners/${r.id}/`,
    scraped_at: new Date().toISOString(),
  }));

  // Inserir em lotes de 100
  const erros = [];
  for (let i = 0; i < rows.length; i += 100) {
    const batch = rows.slice(i, i + 100);
    const res = await fetch(`${supabaseUrl}/rest/v1/scraped_academias`, {
      method: 'POST',
      headers: {
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`,
        'Content-Type': 'application/json',
        'Prefer': 'resolution=merge-duplicates',
      },
      body: JSON.stringify(batch),
    });
    if (!res.ok) {
      const err = await res.text();
      erros.push(`Lote ${i}: ${err}`);
    }
  }
  return { total: rows.length, erros };
}
