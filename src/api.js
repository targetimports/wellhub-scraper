// Todas as chamadas vão para /api/ do servidor Express (funciona em dev e prod)

export async function buscarCidades(term, signal) {
  const res = await fetch(`/api/location?term=${encodeURIComponent(term)}`, { signal });
  if (!res.ok) throw new Error(`Erro ${res.status}`);
  return res.json();
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
