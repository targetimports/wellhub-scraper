// Cidades com coordenadas - busca local, sem API
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
  "guarulhos": { lat: -23.4538, lon: -46.5333 },
  "santos": { lat: -23.9608, lon: -46.3336 },
  "sao bernardo do campo": { lat: -23.6914, lon: -46.5646 },
  "osasco": { lat: -23.5325, lon: -46.7917 },
  "sorocaba": { lat: -23.5015, lon: -47.4526 },
  "ribeirao preto": { lat: -21.1704, lon: -47.8103 },
  "uberlandia": { lat: -18.9186, lon: -48.2772 },
  "joinville": { lat: -26.3045, lon: -48.8487 },
  "londrina": { lat: -23.3045, lon: -51.1696 },
  "niteroi": { lat: -22.8833, lon: -43.1036 },
  "juiz de fora": { lat: -21.7642, lon: -43.3503 },
  "maringa": { lat: -23.4205, lon: -51.9333 },
  "feira de santana": { lat: -12.2545, lon: -38.9543 },
  "vitoria da conquista": { lat: -14.8619, lon: -40.8444 },
  "ilheus": { lat: -14.7936, lon: -39.0464 },
  "camacari": { lat: -12.6996, lon: -38.3263 },
  "lauro de freitas": { lat: -12.8978, lon: -38.3213 },
  "aracaju": { lat: -10.9111, lon: -37.0717 },
  "maceio": { lat: -9.6658, lon: -35.7353 },
  "joao pessoa": { lat: -7.1195, lon: -34.845 },
  "campina grande": { lat: -7.2307, lon: -35.8817 },
  "teresina": { lat: -5.0892, lon: -42.8019 },
  "sao luis": { lat: -2.5297, lon: -44.2825 },
  "cuiaba": { lat: -15.6014, lon: -56.0979 },
  "campo grande": { lat: -20.4697, lon: -54.6201 },
  "palmas": { lat: -10.1689, lon: -48.3317 },
  "porto velho": { lat: -8.7612, lon: -63.9004 },
  "rio branco": { lat: -9.9753, lon: -67.81 },
  "macapa": { lat: 0.0349, lon: -51.0694 },
  "boa vista": { lat: 2.8195, lon: -60.6714 },
  "blumenau": { lat: -26.9194, lon: -49.0661 },
  "chapeco": { lat: -27.1006, lon: -52.6155 },
  "caxias do sul": { lat: -29.1681, lon: -51.1794 },
  "pelotas": { lat: -31.7649, lon: -52.3371 },
  "santa maria": { lat: -29.6842, lon: -53.8069 },
  "ponta grossa": { lat: -25.0945, lon: -50.1633 },
  "cascavel": { lat: -24.9573, lon: -53.4593 },
  "foz do iguacu": { lat: -25.5163, lon: -54.5854 },
  "contagem": { lat: -19.932, lon: -44.0539 },
  "montes claros": { lat: -16.735, lon: -43.8615 },
  "sao jose dos campos": { lat: -23.1896, lon: -45.8841 },
  "santo andre": { lat: -23.6737, lon: -46.5432 },
  "bauru": { lat: -22.3246, lon: -49.0871 },
  "piracicaba": { lat: -22.7338, lon: -47.6476 },
  "jundiai": { lat: -23.1857, lon: -46.8978 },
  "sao jose do rio preto": { lat: -20.8113, lon: -49.3758 },
  "franca": { lat: -20.539, lon: -47.4008 },
  "caruaru": { lat: -8.2823, lon: -35.9761 },
  "petrolina": { lat: -9.3891, lon: -40.5003 },
  "olinda": { lat: -8.0089, lon: -34.8553 },
  "caucaia": { lat: -3.7367, lon: -38.6531 },
  "juazeiro do norte": { lat: -7.2131, lon: -39.3153 },
  "sobral": { lat: -3.6861, lon: -40.3482 },
  "anapolis": { lat: -16.3281, lon: -48.9529 },
  "aparecida de goiania": { lat: -16.8198, lon: -49.2469 },
  "vila velha": { lat: -20.3297, lon: -40.2925 },
  "serra": { lat: -20.1209, lon: -40.3075 },
  "petropolis": { lat: -22.5046, lon: -43.1787 },
  "volta redonda": { lat: -22.5023, lon: -44.1044 },
  "campos dos goytacazes": { lat: -21.7523, lon: -41.3305 },
  "macae": { lat: -22.3714, lon: -41.7869 },
  "cabo frio": { lat: -22.8789, lon: -42.0189 },
  "sao goncalo": { lat: -22.8269, lon: -43.0539 },
  "duque de caxias": { lat: -22.7856, lon: -43.3117 },
  "nova iguacu": { lat: -22.7592, lon: -43.451 },
  "balneario camboriu": { lat: -26.9906, lon: -48.6352 },
  "itajai": { lat: -26.9078, lon: -48.6616 },
  "criciuma": { lat: -28.6775, lon: -49.3697 },
  "novo hamburgo": { lat: -29.6787, lon: -51.1306 },
  "passo fundo": { lat: -28.2624, lon: -52.4068 },
  "canoas": { lat: -29.9178, lon: -51.174 },
  "taubate": { lat: -23.0204, lon: -45.5558 },
  "presidente prudente": { lat: -22.1256, lon: -51.3889 },
  "marilia": { lat: -22.2139, lon: -49.9458 },
  "araraquara": { lat: -21.7946, lon: -48.1756 },
  "mogi das cruzes": { lat: -23.5229, lon: -46.1856 },
  "imperatriz": { lat: -5.519, lon: -47.4735 },
  "santarem": { lat: -2.443, lon: -54.708 },
  "maraba": { lat: -5.3685, lon: -49.1178 },
  "ananindeua": { lat: -1.3659, lon: -48.3886 },
  "rondonopolis": { lat: -16.4673, lon: -54.6372 },
  "sinop": { lat: -11.8642, lon: -55.5066 },
  "dourados": { lat: -22.2233, lon: -54.8083 },
  "mossoró": { lat: -5.1878, lon: -37.3441 },
  "parnamirim": { lat: -5.9116, lon: -35.2363 },
  "arapiraca": { lat: -9.7522, lon: -36.6611 },
  "ji-parana": { lat: -10.8853, lon: -61.9517 },
  "betim": { lat: -19.9678, lon: -44.1983 },
  "uberaba": { lat: -19.7472, lon: -47.9318 },
  "governador valadares": { lat: -18.8509, lon: -41.9494 },
  "ipatinga": { lat: -19.4684, lon: -42.5367 },
  "pocos de caldas": { lat: -21.7878, lon: -46.5613 },
  "rio verde": { lat: -17.7928, lon: -50.9192 },
  "varzea grande": { lat: -15.646, lon: -56.1325 },
  "tres lagoas": { lat: -20.7849, lon: -51.7008 },
  "gravataí": { lat: -29.9447, lon: -50.992 },
  "sao jose dos pinhais": { lat: -25.5369, lon: -49.2063 },
  "cariacica": { lat: -20.2636, lon: -40.4164 },
  "jaboatao dos guararapes": { lat: -8.113, lon: -35.0156 },
};

function normalize(str) {
  return str.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z\s]/g, '').trim();
}

export function resolverCidade(texto) {
  const norm = normalize(texto);
  if (CIDADES_DB[norm]) return CIDADES_DB[norm];
  // Busca parcial
  for (const [key, coords] of Object.entries(CIDADES_DB)) {
    if (key.includes(norm) || norm.includes(key)) return coords;
  }
  return null;
}

export async function buscarParceiros(lat, lon, limit, offset, term, signal) {
  const params = new URLSearchParams({
    lat: String(lat), lon: String(lon), limit: String(limit), offset: String(offset),
  });
  if (term) params.set('term', term);
  const res = await fetch(`/api/search?${params}`, { signal });
  if (!res.ok) throw new Error(`Erro ${res.status}`);
  return res.json();
}

export async function buscarDetalhes(id, signal) {
  try {
    const res = await fetch(`/api/details?id=${id}`, { signal });
    if (!res.ok) return { id, nome: '', telefone: '', endereco: '' };
    return res.json();
  } catch {
    return { id, nome: '', telefone: '', endereco: '' };
  }
}
