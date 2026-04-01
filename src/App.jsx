import { useState, useRef } from 'react';

const CIDADES = [
  { nome: 'São Paulo', lat: -23.5505, lon: -46.6333 },
  { nome: 'Rio de Janeiro', lat: -22.9068, lon: -43.1729 },
  { nome: 'Belo Horizonte', lat: -19.9167, lon: -43.9345 },
  { nome: 'Curitiba', lat: -25.4284, lon: -49.2733 },
  { nome: 'Porto Alegre', lat: -30.0346, lon: -51.2177 },
  { nome: 'Brasília', lat: -15.7975, lon: -47.8919 },
  { nome: 'Salvador', lat: -12.9714, lon: -38.5124 },
  { nome: 'Fortaleza', lat: -3.7172, lon: -38.5433 },
  { nome: 'Recife', lat: -8.0476, lon: -34.877 },
  { nome: 'Goiânia', lat: -16.6869, lon: -49.2648 },
  { nome: 'Campinas', lat: -22.9099, lon: -47.0626 },
  { nome: 'Florianópolis', lat: -27.5954, lon: -48.548 },
  { nome: 'Santos', lat: -23.9608, lon: -46.3336 },
  { nome: 'Ribeirão Preto', lat: -21.1704, lon: -47.8103 },
  { nome: 'Natal', lat: -5.7945, lon: -35.211 },
  { nome: 'Manaus', lat: -3.119, lon: -60.0217 },
  { nome: 'Londrina', lat: -23.3045, lon: -51.1696 },
  { nome: 'Niterói', lat: -22.8833, lon: -43.1036 },
  { nome: 'Joinville', lat: -26.3045, lon: -48.8487 },
  { nome: 'Uberlândia', lat: -18.9186, lon: -48.2772 },
  { nome: 'Sorocaba', lat: -23.5015, lon: -47.4526 },
  { nome: 'Maringá', lat: -23.4205, lon: -51.9333 },
  { nome: 'Guarulhos', lat: -23.4538, lon: -46.5333 },
  { nome: 'São Bernardo', lat: -23.6914, lon: -46.5646 },
  { nome: 'Osasco', lat: -23.5325, lon: -46.7917 },
  { nome: 'Juiz de Fora', lat: -21.7642, lon: -43.3503 },
  { nome: 'Belém', lat: -1.4558, lon: -48.5024 },
  { nome: 'Vitória', lat: -20.3155, lon: -40.3128 },
];

export default function App() {
  const [cidade, setCidade] = useState(CIDADES[0]);
  const [termo, setTermo] = useState('');
  const [resultados, setResultados] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showCidades, setShowCidades] = useState(false);
  const [erro, setErro] = useState('');
  const [progresso, setProgresso] = useState('');
  const abortRef = useRef(null);

  const buscar = async () => {
    setLoading(true);
    setResultados([]);
    setErro('');
    setProgresso('Conectando ao Wellhub...');

    const controller = new AbortController();
    abortRef.current = controller;

    try {
      let allResults = [];
      let offset = 0;
      const limit = 20;
      let page = 1;

      while (offset < 500) {
        if (controller.signal.aborted) break;
        setProgresso(`Buscando página ${page}...`);

        const params = new URLSearchParams({
          lat: String(cidade.lat),
          lon: String(cidade.lon),
          limit: String(limit),
          offset: String(offset),
        });
        if (termo) params.set('term', termo);

        const res = await fetch(`/api/search?${params}`, { signal: controller.signal });
        if (!res.ok) throw new Error(`Erro ${res.status} na API`);

        const data = await res.json();
        if (!data || !Array.isArray(data) || data.length === 0) break;

        allResults = [...allResults, ...data];
        setResultados([...allResults]);
        setProgresso(`${allResults.length} academias encontradas...`);
        offset += limit;
        page++;

        if (data.length < limit) break;
      }

      setProgresso('');
    } catch (err) {
      if (err.name !== 'AbortError') {
        setErro('Erro ao buscar: ' + err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const parar = () => {
    if (abortRef.current) abortRef.current.abort();
    setLoading(false);
    setProgresso('');
  };

  const getActivities = (partner) => {
    const acts = partner.activities || [];
    return acts.map(a => typeof a === 'object' ? a.name : a).filter(Boolean);
  };

  const getHours = (partner) => {
    const h = partner.openingHours;
    if (!h) return '';
    if (typeof h === 'string') return h;
    return h.opens && h.closes ? `${h.opens} - ${h.closes}` : '';
  };

  const getDistance = (partner) => {
    if (partner.distance == null) return '';
    const d = Number(partner.distance);
    return isNaN(d) ? String(partner.distance) : d < 1000 ? `${Math.round(d)} m` : `${(d / 1000).toFixed(1)} km`;
  };

  const exportarCSV = () => {
    if (!resultados.length) return;
    const headers = ['Nome', 'Endereco', 'Telefone', 'Atividades', 'Distancia', 'Horario', 'Plano Minimo', 'Preco', 'Avaliacao', 'Link'];
    const rows = resultados.map(r => [
      r.name || '',
      (r.fullAddress || '').replace(/"/g, '""'),
      r.phone || '',
      getActivities(r).join(' | '),
      getDistance(r),
      getHours(r),
      r.lowestPlan?.name || '',
      r.lowestPlan?.price ? `R$ ${r.lowestPlan.price}` : '',
      r.rating || '',
      `https://wellhub.com/pt-br/search/partners/${r.id}/`,
    ]);
    const csv = [headers, ...rows].map(r => r.map(c => `"${c}"`).join(',')).join('\n');
    downloadFile('\ufeff' + csv, `wellhub_${cidade.nome}_${Date.now()}.csv`, 'text/csv;charset=utf-8;');
  };

  const exportarJSON = () => {
    if (!resultados.length) return;
    const data = resultados.map(r => ({
      nome: r.name,
      endereco: r.fullAddress,
      telefone: r.phone || '',
      atividades: getActivities(r),
      horario: getHours(r),
      distancia: getDistance(r),
      plano: r.lowestPlan?.name || '',
      preco: r.lowestPlan?.price ? `R$ ${r.lowestPlan.price}` : '',
      avaliacao: r.rating || '',
      lat: r.location?.lat,
      lon: r.location?.lon,
      imagem: r.imageUrl || '',
      link: `https://wellhub.com/pt-br/search/partners/${r.id}/`,
    }));
    downloadFile(JSON.stringify(data, null, 2), `wellhub_${cidade.nome}_${Date.now()}.json`, 'application/json');
  };

  const downloadFile = (content, filename, type) => {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename.replace(/\s/g, '_');
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div style={{ minHeight: '100vh', background: '#0f172a', color: '#e2e8f0', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' }}>

      {/* ── HEADER ── */}
      <div style={{ background: 'linear-gradient(135deg, #e11d48, #be185d)', padding: '24px 0' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 20px' }}>
          <h1 style={{ fontSize: 28, fontWeight: 800, color: '#fff', margin: 0 }}>
            🏋️ Wellhub Scraper
          </h1>
          <p style={{ color: '#fecdd3', margin: '4px 0 0', fontSize: 14 }}>
            Busque academias em qualquer cidade do Brasil
          </p>
        </div>
      </div>

      {/* ── BARRA DE PESQUISA ── */}
      <div style={{ maxWidth: 1200, margin: '-20px auto 0', padding: '0 20px' }}>
        <div style={{
          background: '#1e293b', borderRadius: 16, padding: 24,
          border: '1px solid #334155', boxShadow: '0 25px 50px rgba(0,0,0,0.4)'
        }}>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>

            {/* Cidade dropdown */}
            <div style={{ flex: '1 1 220px', position: 'relative' }}>
              <label style={{ fontSize: 12, color: '#94a3b8', marginBottom: 4, display: 'block' }}>📍 Cidade</label>
              <button
                onClick={() => setShowCidades(!showCidades)}
                style={{
                  width: '100%', padding: '12px 16px', background: '#0f172a', border: '1px solid #475569',
                  borderRadius: 10, color: '#fff', textAlign: 'left', cursor: 'pointer', fontSize: 15
                }}
              >
                {cidade.nome} ▾
              </button>
              {showCidades && (
                <div style={{
                  position: 'absolute', zIndex: 99, top: '100%', left: 0, right: 0,
                  background: '#1e293b', border: '1px solid #475569', borderRadius: 10,
                  maxHeight: 300, overflowY: 'auto', marginTop: 4, boxShadow: '0 10px 30px rgba(0,0,0,0.5)'
                }}>
                  {CIDADES.map(c => (
                    <button
                      key={c.nome}
                      onClick={() => { setCidade(c); setShowCidades(false); }}
                      style={{
                        width: '100%', padding: '10px 16px', border: 'none', textAlign: 'left',
                        background: c.nome === cidade.nome ? '#e11d4820' : 'transparent',
                        color: c.nome === cidade.nome ? '#fb7185' : '#cbd5e1',
                        cursor: 'pointer', fontSize: 14
                      }}
                      onMouseEnter={e => e.target.style.background = '#334155'}
                      onMouseLeave={e => e.target.style.background = c.nome === cidade.nome ? '#e11d4820' : 'transparent'}
                    >
                      {c.nome}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Termo de busca */}
            <div style={{ flex: '2 1 300px' }}>
              <label style={{ fontSize: 12, color: '#94a3b8', marginBottom: 4, display: 'block' }}>🔍 Buscar</label>
              <input
                type="text"
                value={termo}
                onChange={e => setTermo(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && !loading && buscar()}
                placeholder="academia, crossfit, yoga, pilates, natação..."
                style={{
                  width: '100%', padding: '12px 16px', background: '#0f172a', border: '1px solid #475569',
                  borderRadius: 10, color: '#fff', fontSize: 15, outline: 'none', boxSizing: 'border-box'
                }}
              />
            </div>

            {/* Botão */}
            <div style={{ flex: '0 0 auto', display: 'flex', alignItems: 'flex-end' }}>
              {loading ? (
                <button onClick={parar} style={{
                  padding: '12px 28px', background: '#dc2626', color: '#fff', border: 'none',
                  borderRadius: 10, cursor: 'pointer', fontSize: 15, fontWeight: 600
                }}>
                  ⏹ Parar
                </button>
              ) : (
                <button onClick={buscar} style={{
                  padding: '12px 28px', background: '#e11d48', color: '#fff', border: 'none',
                  borderRadius: 10, cursor: 'pointer', fontSize: 15, fontWeight: 600
                }}>
                  🔍 Buscar
                </button>
              )}
            </div>
          </div>

          {/* Progresso / Erro */}
          {progresso && <p style={{ marginTop: 12, color: '#fbbf24', fontSize: 14 }}>⏳ {progresso}</p>}
          {erro && <p style={{ marginTop: 12, color: '#f87171', fontSize: 14 }}>❌ {erro}</p>}
        </div>
      </div>

      {/* ── RESULTADOS ── */}
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '20px 20px 40px' }}>

        {/* Stats + Downloads */}
        {resultados.length > 0 && (
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 12 }}>
            <p style={{ color: '#94a3b8', margin: 0 }}>
              <span style={{ color: '#fff', fontWeight: 700, fontSize: 20 }}>{resultados.length}</span> academias em{' '}
              <span style={{ color: '#fb7185' }}>{cidade.nome}</span>
            </p>
            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={exportarCSV} style={{
                padding: '8px 20px', background: '#059669', color: '#fff', border: 'none',
                borderRadius: 8, cursor: 'pointer', fontSize: 14, fontWeight: 600
              }}>
                📥 Baixar CSV
              </button>
              <button onClick={exportarJSON} style={{
                padding: '8px 20px', background: '#2563eb', color: '#fff', border: 'none',
                borderRadius: 8, cursor: 'pointer', fontSize: 14, fontWeight: 600
              }}>
                📥 Baixar JSON
              </button>
            </div>
          </div>
        )}

        {/* Tabela */}
        {resultados.length > 0 && (
          <div style={{ overflowX: 'auto', borderRadius: 12, border: '1px solid #334155' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
              <thead>
                <tr style={{ background: '#1e293b' }}>
                  <th style={thStyle}>#</th>
                  <th style={thStyle}>Nome</th>
                  <th style={thStyle}>Endereço</th>
                  <th style={thStyle}>Telefone</th>
                  <th style={thStyle}>Atividades</th>
                  <th style={thStyle}>Dist.</th>
                  <th style={thStyle}>Horário</th>
                  <th style={thStyle}>Plano</th>
                  <th style={thStyle}>⭐</th>
                  <th style={thStyle}>Link</th>
                </tr>
              </thead>
              <tbody>
                {resultados.map((r, i) => (
                  <tr key={r.id || i} style={{ borderBottom: '1px solid #1e293b', background: i % 2 === 0 ? '#0f172a' : '#111827' }}>
                    <td style={tdStyle}>{i + 1}</td>
                    <td style={{ ...tdStyle, fontWeight: 600, color: '#fff', minWidth: 180 }}>{r.name}</td>
                    <td style={{ ...tdStyle, color: '#94a3b8', minWidth: 200, fontSize: 13 }}>{r.fullAddress || '-'}</td>
                    <td style={{ ...tdStyle, color: r.phone ? '#34d399' : '#475569', whiteSpace: 'nowrap' }}>
                      {r.phone ? (
                        <a href={`tel:${r.phone}`} style={{ color: '#34d399', textDecoration: 'none' }}>{r.phone}</a>
                      ) : '-'}
                    </td>
                    <td style={{ ...tdStyle, maxWidth: 200 }}>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
                        {getActivities(r).slice(0, 3).map((a, j) => (
                          <span key={j} style={{
                            padding: '2px 8px', background: '#e11d4820', color: '#fb7185',
                            borderRadius: 20, fontSize: 11, whiteSpace: 'nowrap'
                          }}>{a}</span>
                        ))}
                        {getActivities(r).length > 3 && (
                          <span style={{ padding: '2px 8px', background: '#334155', color: '#94a3b8', borderRadius: 20, fontSize: 11 }}>
                            +{getActivities(r).length - 3}
                          </span>
                        )}
                      </div>
                    </td>
                    <td style={{ ...tdStyle, whiteSpace: 'nowrap', color: '#94a3b8' }}>{getDistance(r) || '-'}</td>
                    <td style={{ ...tdStyle, whiteSpace: 'nowrap', color: '#94a3b8' }}>{getHours(r) || '-'}</td>
                    <td style={{ ...tdStyle, whiteSpace: 'nowrap' }}>
                      {r.lowestPlan ? (
                        <span style={{ color: '#34d399' }}>
                          {r.lowestPlan.name}
                          {r.lowestPlan.price && <span style={{ color: '#64748b' }}> R${r.lowestPlan.price}</span>}
                        </span>
                      ) : '-'}
                    </td>
                    <td style={{ ...tdStyle, color: '#fbbf24', whiteSpace: 'nowrap' }}>{r.rating || '-'}</td>
                    <td style={tdStyle}>
                      <a
                        href={`https://wellhub.com/pt-br/search/partners/${r.id}/`}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ color: '#60a5fa', textDecoration: 'none', fontSize: 13 }}
                      >
                        Abrir ↗
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Cards em grid para mobile */}
        {resultados.length > 0 && (
          <div className="mobile-cards" style={{ display: 'none' }}>
            {resultados.map((r, i) => (
              <div key={r.id || i} style={{
                background: '#1e293b', borderRadius: 12, padding: 16, marginBottom: 12,
                border: '1px solid #334155'
              }}>
                <div style={{ display: 'flex', gap: 12 }}>
                  {r.imageUrl && (
                    <img src={r.imageUrl} alt="" style={{ width: 80, height: 80, borderRadius: 8, objectFit: 'cover' }} />
                  )}
                  <div style={{ flex: 1 }}>
                    <h3 style={{ margin: 0, fontSize: 16, color: '#fff' }}>{r.name}</h3>
                    {r.fullAddress && <p style={{ margin: '4px 0', fontSize: 13, color: '#94a3b8' }}>📍 {r.fullAddress}</p>}
                    {r.phone && <p style={{ margin: '4px 0', fontSize: 13, color: '#34d399' }}>📞 {r.phone}</p>}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Estado vazio */}
        {!loading && resultados.length === 0 && !erro && (
          <div style={{ textAlign: 'center', padding: '80px 20px' }}>
            <div style={{ fontSize: 64 }}>🏋️</div>
            <h3 style={{ color: '#475569', fontSize: 20, marginTop: 16 }}>Selecione uma cidade e clique em Buscar</h3>
            <p style={{ color: '#334155', marginTop: 8 }}>Resultados com nome, endereço, telefone e atividades</p>
          </div>
        )}
      </div>
    </div>
  );
}

const thStyle = {
  padding: '12px 10px',
  textAlign: 'left',
  color: '#94a3b8',
  fontWeight: 600,
  fontSize: 12,
  textTransform: 'uppercase',
  letterSpacing: '0.05em',
  whiteSpace: 'nowrap',
  borderBottom: '2px solid #334155',
};

const tdStyle = {
  padding: '10px',
  verticalAlign: 'top',
};
