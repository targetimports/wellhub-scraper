// Cidades organizadas por estado
const ESTADOS = {
  "SP": [
    { nome: "São Paulo", lat: -23.5505, lon: -46.6333 },
    { nome: "Campinas", lat: -22.9099, lon: -47.0626 },
    { nome: "Santos", lat: -23.9608, lon: -46.3336 },
    { nome: "Guarulhos", lat: -23.4538, lon: -46.5333 },
    { nome: "São Bernardo", lat: -23.6914, lon: -46.5646 },
    { nome: "Osasco", lat: -23.5325, lon: -46.7917 },
    { nome: "Sorocaba", lat: -23.5015, lon: -47.4526 },
    { nome: "Ribeirão Preto", lat: -21.1704, lon: -47.8103 },
    { nome: "São José dos Campos", lat: -23.1896, lon: -45.8841 },
    { nome: "Santo André", lat: -23.6737, lon: -46.5432 },
    { nome: "Bauru", lat: -22.3246, lon: -49.0871 },
    { nome: "Piracicaba", lat: -22.7338, lon: -47.6476 },
    { nome: "Jundiaí", lat: -23.1857, lon: -46.8978 },
    { nome: "São José do Rio Preto", lat: -20.8113, lon: -49.3758 },
    { nome: "Franca", lat: -20.539, lon: -47.4008 },
    { nome: "Taubaté", lat: -23.0204, lon: -45.5558 },
    { nome: "Mogi das Cruzes", lat: -23.5229, lon: -46.1856 },
    { nome: "Presidente Prudente", lat: -22.1256, lon: -51.3889 },
    { nome: "Marília", lat: -22.2139, lon: -49.9458 },
    { nome: "Araraquara", lat: -21.7946, lon: -48.1756 },
  ],
  "RJ": [
    { nome: "Rio de Janeiro", lat: -22.9068, lon: -43.1729 },
    { nome: "Niterói", lat: -22.8833, lon: -43.1036 },
    { nome: "São Gonçalo", lat: -22.8269, lon: -43.0539 },
    { nome: "Duque de Caxias", lat: -22.7856, lon: -43.3117 },
    { nome: "Nova Iguaçu", lat: -22.7592, lon: -43.451 },
    { nome: "Petrópolis", lat: -22.5046, lon: -43.1787 },
    { nome: "Volta Redonda", lat: -22.5023, lon: -44.1044 },
    { nome: "Campos", lat: -21.7523, lon: -41.3305 },
    { nome: "Macaé", lat: -22.3714, lon: -41.7869 },
    { nome: "Cabo Frio", lat: -22.8789, lon: -42.0189 },
  ],
  "MG": [
    { nome: "Belo Horizonte", lat: -19.9167, lon: -43.9345 },
    { nome: "Uberlândia", lat: -18.9186, lon: -48.2772 },
    { nome: "Contagem", lat: -19.932, lon: -44.0539 },
    { nome: "Juiz de Fora", lat: -21.7642, lon: -43.3503 },
    { nome: "Betim", lat: -19.9678, lon: -44.1983 },
    { nome: "Montes Claros", lat: -16.735, lon: -43.8615 },
    { nome: "Uberaba", lat: -19.7472, lon: -47.9318 },
    { nome: "Gov. Valadares", lat: -18.8509, lon: -41.9494 },
    { nome: "Ipatinga", lat: -19.4684, lon: -42.5367 },
    { nome: "Poços de Caldas", lat: -21.7878, lon: -46.5613 },
  ],
  "RS": [
    { nome: "Porto Alegre", lat: -30.0346, lon: -51.2177 },
    { nome: "Caxias do Sul", lat: -29.1681, lon: -51.1794 },
    { nome: "Pelotas", lat: -31.7649, lon: -52.3371 },
    { nome: "Canoas", lat: -29.9178, lon: -51.174 },
    { nome: "Santa Maria", lat: -29.6842, lon: -53.8069 },
    { nome: "Novo Hamburgo", lat: -29.6787, lon: -51.1306 },
    { nome: "Passo Fundo", lat: -28.2624, lon: -52.4068 },
  ],
  "PR": [
    { nome: "Curitiba", lat: -25.4284, lon: -49.2733 },
    { nome: "Londrina", lat: -23.3045, lon: -51.1696 },
    { nome: "Maringá", lat: -23.4205, lon: -51.9333 },
    { nome: "Ponta Grossa", lat: -25.0945, lon: -50.1633 },
    { nome: "Cascavel", lat: -24.9573, lon: -53.4593 },
    { nome: "Foz do Iguaçu", lat: -25.5163, lon: -54.5854 },
  ],
  "SC": [
    { nome: "Florianópolis", lat: -27.5954, lon: -48.548 },
    { nome: "Joinville", lat: -26.3045, lon: -48.8487 },
    { nome: "Blumenau", lat: -26.9194, lon: -49.0661 },
    { nome: "Chapecó", lat: -27.1006, lon: -52.6155 },
    { nome: "Bal. Camboriú", lat: -26.9906, lon: -48.6352 },
    { nome: "Criciúma", lat: -28.6775, lon: -49.3697 },
    { nome: "Itajaí", lat: -26.9078, lon: -48.6616 },
  ],
  "BA": [
    { nome: "Salvador", lat: -12.9714, lon: -38.5124 },
    { nome: "Feira de Santana", lat: -12.2545, lon: -38.9543 },
    { nome: "Vitória da Conquista", lat: -14.8619, lon: -40.8444 },
    { nome: "Camaçari", lat: -12.6996, lon: -38.3263 },
    { nome: "Ilhéus", lat: -14.7936, lon: -39.0464 },
    { nome: "Lauro de Freitas", lat: -12.8978, lon: -38.3213 },
  ],
  "PE": [
    { nome: "Recife", lat: -8.0476, lon: -34.877 },
    { nome: "Jaboatão", lat: -8.113, lon: -35.0156 },
    { nome: "Olinda", lat: -8.0089, lon: -34.8553 },
    { nome: "Caruaru", lat: -8.2823, lon: -35.9761 },
    { nome: "Petrolina", lat: -9.3891, lon: -40.5003 },
  ],
  "CE": [
    { nome: "Fortaleza", lat: -3.7172, lon: -38.5433 },
    { nome: "Caucaia", lat: -3.7367, lon: -38.6531 },
    { nome: "Juazeiro do Norte", lat: -7.2131, lon: -39.3153 },
    { nome: "Sobral", lat: -3.6861, lon: -40.3482 },
  ],
  "GO": [
    { nome: "Goiânia", lat: -16.6869, lon: -49.2648 },
    { nome: "Aparecida de Goiânia", lat: -16.8198, lon: -49.2469 },
    { nome: "Anápolis", lat: -16.3281, lon: -48.9529 },
    { nome: "Rio Verde", lat: -17.7928, lon: -50.9192 },
  ],
  "DF": [
    { nome: "Brasília", lat: -15.7975, lon: -47.8919 },
  ],
  "PA": [
    { nome: "Belém", lat: -1.4558, lon: -48.5024 },
    { nome: "Ananindeua", lat: -1.3659, lon: -48.3886 },
    { nome: "Santarém", lat: -2.443, lon: -54.708 },
    { nome: "Marabá", lat: -5.3685, lon: -49.1178 },
  ],
  "AM": [{ nome: "Manaus", lat: -3.119, lon: -60.0217 }],
  "MA": [
    { nome: "São Luís", lat: -2.5297, lon: -44.2825 },
    { nome: "Imperatriz", lat: -5.519, lon: -47.4735 },
  ],
  "ES": [
    { nome: "Vitória", lat: -20.3155, lon: -40.3128 },
    { nome: "Vila Velha", lat: -20.3297, lon: -40.2925 },
    { nome: "Serra", lat: -20.1209, lon: -40.3075 },
    { nome: "Cariacica", lat: -20.2636, lon: -40.4164 },
  ],
  "RN": [
    { nome: "Natal", lat: -5.7945, lon: -35.211 },
    { nome: "Mossoró", lat: -5.1878, lon: -37.3441 },
    { nome: "Parnamirim", lat: -5.9116, lon: -35.2363 },
  ],
  "PB": [
    { nome: "João Pessoa", lat: -7.1195, lon: -34.845 },
    { nome: "Campina Grande", lat: -7.2307, lon: -35.8817 },
  ],
  "AL": [
    { nome: "Maceió", lat: -9.6658, lon: -35.7353 },
    { nome: "Arapiraca", lat: -9.7522, lon: -36.6611 },
  ],
  "SE": [{ nome: "Aracaju", lat: -10.9111, lon: -37.0717 }],
  "PI": [{ nome: "Teresina", lat: -5.0892, lon: -42.8019 }],
  "MT": [
    { nome: "Cuiabá", lat: -15.6014, lon: -56.0979 },
    { nome: "Rondonópolis", lat: -16.4673, lon: -54.6372 },
    { nome: "Sinop", lat: -11.8642, lon: -55.5066 },
  ],
  "MS": [
    { nome: "Campo Grande", lat: -20.4697, lon: -54.6201 },
    { nome: "Dourados", lat: -22.2233, lon: -54.8083 },
    { nome: "Três Lagoas", lat: -20.7849, lon: -51.7008 },
  ],
  "TO": [{ nome: "Palmas", lat: -10.1689, lon: -48.3317 }],
  "RO": [
    { nome: "Porto Velho", lat: -8.7612, lon: -63.9004 },
    { nome: "Ji-Paraná", lat: -10.8853, lon: -61.9517 },
  ],
  "AC": [{ nome: "Rio Branco", lat: -9.9753, lon: -67.81 }],
  "AP": [{ nome: "Macapá", lat: 0.0349, lon: -51.0694 }],
  "RR": [{ nome: "Boa Vista", lat: 2.8195, lon: -60.6714 }],
};

function normalize(str) {
  return str.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z\s]/g, '').trim();
}

// Retorna lista de {nome, lat, lon} para buscar
export function resolverBusca(texto) {
  const norm = normalize(texto);

  // Verificar se é um estado (UF)
  const uf = texto.trim().toUpperCase();
  if (ESTADOS[uf]) {
    return { tipo: 'estado', uf, cidades: ESTADOS[uf] };
  }

  // Buscar cidade exata
  for (const [estado, cidades] of Object.entries(ESTADOS)) {
    for (const c of cidades) {
      const cidadeNorm = normalize(c.nome);
      if (cidadeNorm === norm || cidadeNorm.includes(norm) || norm.includes(cidadeNorm)) {
        return { tipo: 'cidade', uf: estado, cidades: [c] };
      }
    }
  }

  return null;
}

export function listarEstados() {
  return Object.entries(ESTADOS).map(([uf, cidades]) => ({
    uf,
    totalCidades: cidades.length,
    cidades: cidades.map(c => c.nome),
  }));
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
