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
  { nome: 'Guarulhos', lat: -23.4538, lon: -46.5333 },
  { nome: 'Osasco', lat: -23.5325, lon: -46.7917 },
  { nome: 'Belém', lat: -1.4558, lon: -48.5024 },
  { nome: 'Vitória', lat: -20.3155, lon: -40.3128 },
];

export default function App() {
  const [cidade, setCidade] = useState(CIDADES[0]);
  const [termo, setTermo] = useState('');
  const [resultados, setResultados] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showCidades, setShowCidades] = useState(false);
  const [progresso, setProgresso] = useState('');
  const [erro, setErro] = useState('');
  const abortRef = useRef(null);

  const buscar = async () => {
    setLoading(true);
    setResultados([]);
    setErro('');

    const controller = new AbortController();
    abortRef.current = controller;

    try {
      // PASSO 1: buscar lista de parceiros
      setProgresso('Buscando academias...');
      let allPartners = [];
      let offset = 0;

      while (offset < 500) {
        if (controller.signal.aborted) break;

        const params = new URLSearchParams({
          lat: String(cidade.lat), lon: String(cidade.lon),
          limit: '20', offset: String(offset),
        });
        if (termo) params.set('term', termo);

        const res = await fetch(`/api/search?${params}`, { signal: controller.signal });
        if (!res.ok) throw new Error(`Erro ${res.status}`);
        const data = await res.json();
        if (!Array.isArray(data) || data.length === 0) break;

        allPartners = [...allPartners, ...data];
        setProgresso(`${allPartners.length} academias encontradas, buscando mais...`);
        offset += 20;
        if (data.length < 20) break;
      }

      if (controller.signal.aborted) return;
      setProgresso(`${allPartners.length} academias encontradas! Buscando telefones... (0/${allPartners.length})`);

      // PASSO 2: entrar em cada pagina para pegar telefone
      const finalResults = [];
      for (let i = 0; i < allPartners.length; i++) {
        if (controller.signal.aborted) break;

        const p = allPartners[i];
        setProgresso(`Buscando telefone ${i + 1}/${allPartners.length}: ${p.name || '...'}`)

        try {
          const detRes = await fetch(`/api/details?id=${p.id}`, { signal: controller.signal });
          const det = await detRes.json();

          finalResults.push({
            nome: det.nome || p.name || '',
            telefone: det.telefone || '',
            endereco: p.fullAddress || det.endereco || '',
            id: p.id,
          });
        } catch {
          finalResults.push({
            nome: p.name || '',
            telefone: '',
            endereco: p.fullAddress || '',
            id: p.id,
          });
        }

        setResultados([...finalResults]);
      }

      setProgresso('');
    } catch (err) {
      if (err.name !== 'AbortError') setErro(err.message);
    } finally {
      setLoading(false);
    }
  };

  const parar = () => {
    abortRef.current?.abort();
    setLoading(false);
    setProgresso('');
  };

  const exportarCSV = () => {
    if (!resultados.length) return;
    const rows = [['Nome', 'Telefone', 'Endereco']];
    resultados.forEach(r => rows.push([r.nome, r.telefone, r.endereco.replace(/"/g, '""')]));
    const csv = rows.map(r => r.map(c => `"${c}"`).join(',')).join('\n');
    download('\ufeff' + csv, `academias_${cidade.nome}_${Date.now()}.csv`, 'text/csv;charset=utf-8;');
  };

  const exportarJSON = () => {
    if (!resultados.length) return;
    download(JSON.stringify(resultados, null, 2), `academias_${cidade.nome}_${Date.now()}.json`, 'application/json');
  };

  const download = (content, name, type) => {
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([content], { type }));
    a.download = name.replace(/\s/g, '_');
    a.click();
  };

  const comTelefone = resultados.filter(r => r.telefone);

  return (
    <div style={{ minHeight: '100vh', background: '#0f172a', color: '#e2e8f0', fontFamily: 'system-ui, sans-serif' }}>

      {/* HEADER */}
      <div style={{ background: 'linear-gradient(135deg, #e11d48, #9333ea)', padding: '28px 0' }}>
        <div style={{ maxWidth: 900, margin: '0 auto', padding: '0 20px' }}>
          <h1 style={{ fontSize: 26, fontWeight: 800, color: '#fff', margin: 0 }}>
            🏋️ Wellhub Scraper
          </h1>
          <p style={{ color: '#fecdd3', margin: '4px 0 0', fontSize: 14 }}>
            Busca nome e telefone de academias
          </p>
        </div>
      </div>

      {/* BARRA DE PESQUISA */}
      <div style={{ maxWidth: 900, margin: '-16px auto 0', padding: '0 20px' }}>
        <div style={{
          background: '#1e293b', borderRadius: 16, padding: 20,
          border: '1px solid #334155', boxShadow: '0 20px 40px rgba(0,0,0,0.4)'
        }}>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>

            {/* CIDADE */}
            <div style={{ flex: '1 1 200px', position: 'relative' }}>
              <label style={labelStyle}>📍 Cidade</label>
              <button onClick={() => setShowCidades(!showCidades)} style={inputStyle}>
                {cidade.nome} ▾
              </button>
              {showCidades && (
                <div style={{
                  position: 'absolute', zIndex: 99, top: '100%', left: 0, right: 0, marginTop: 4,
                  background: '#1e293b', border: '1px solid #475569', borderRadius: 10,
                  maxHeight: 280, overflowY: 'auto', boxShadow: '0 10px 30px rgba(0,0,0,0.6)'
                }}>
                  {CIDADES.map(c => (
                    <button key={c.nome}
                      onClick={() => { setCidade(c); setShowCidades(false); }}
                      style={{
                        width: '100%', padding: '10px 16px', border: 'none', textAlign: 'left',
                        background: c.nome === cidade.nome ? '#e11d4830' : 'transparent',
                        color: c.nome === cidade.nome ? '#fb7185' : '#cbd5e1',
                        cursor: 'pointer', fontSize: 14,
                      }}
                    >{c.nome}</button>
                  ))}
                </div>
              )}
            </div>

            {/* BUSCA */}
            <div style={{ flex: '2 1 250px' }}>
              <label style={labelStyle}>🔍 Tipo (opcional)</label>
              <input type="text" value={termo} onChange={e => setTermo(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && !loading && buscar()}
                placeholder="academia, crossfit, yoga, pilates..."
                style={{ ...inputStyle, boxSizing: 'border-box', width: '100%' }}
              />
            </div>

            {/* BOTAO */}
            <div style={{ display: 'flex', alignItems: 'flex-end' }}>
              {loading ? (
                <button onClick={parar} style={{ ...btnStyle, background: '#dc2626' }}>⏹ Parar</button>
              ) : (
                <button onClick={buscar} style={btnStyle}>🔍 Buscar</button>
              )}
            </div>
          </div>

          {progresso && <p style={{ marginTop: 10, color: '#fbbf24', fontSize: 13 }}>⏳ {progresso}</p>}
          {erro && <p style={{ marginTop: 10, color: '#f87171', fontSize: 13 }}>❌ {erro}</p>}
        </div>
      </div>

      {/* RESULTADOS */}
      <div style={{ maxWidth: 900, margin: '0 auto', padding: '20px 20px 60px' }}>

        {/* STATS + DOWNLOADS */}
        {resultados.length > 0 && (
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, flexWrap: 'wrap', gap: 10 }}>
            <div>
              <span style={{ color: '#fff', fontWeight: 700, fontSize: 18 }}>{resultados.length}</span>
              <span style={{ color: '#94a3b8' }}> academias</span>
              {comTelefone.length > 0 && (
                <span style={{ color: '#34d399', marginLeft: 8 }}>
                  ({comTelefone.length} com telefone)
                </span>
              )}
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={exportarCSV} style={{ ...dlBtn, background: '#059669' }}>📥 CSV</button>
              <button onClick={exportarJSON} style={{ ...dlBtn, background: '#2563eb' }}>📥 JSON</button>
            </div>
          </div>
        )}

        {/* TABELA */}
        {resultados.length > 0 && (
          <div style={{ borderRadius: 12, border: '1px solid #334155', overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#1e293b' }}>
                  <th style={th}>#</th>
                  <th style={th}>Nome da Academia</th>
                  <th style={th}>Telefone</th>
                  <th style={th}>Endereço</th>
                </tr>
              </thead>
              <tbody>
                {resultados.map((r, i) => (
                  <tr key={r.id || i} style={{ borderBottom: '1px solid #1e293b', background: i % 2 === 0 ? '#0f172a' : '#111827' }}>
                    <td style={td}>{i + 1}</td>
                    <td style={{ ...td, color: '#fff', fontWeight: 600 }}>{r.nome || '-'}</td>
                    <td style={td}>
                      {r.telefone ? (
                        <a href={`tel:${r.telefone}`} style={{ color: '#34d399', textDecoration: 'none', fontWeight: 600 }}>
                          📞 {r.telefone}
                        </a>
                      ) : (
                        <span style={{ color: '#475569' }}>—</span>
                      )}
                    </td>
                    <td style={{ ...td, color: '#94a3b8', fontSize: 13 }}>{r.endereco || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* VAZIO */}
        {!loading && resultados.length === 0 && !erro && (
          <div style={{ textAlign: 'center', padding: '80px 20px' }}>
            <div style={{ fontSize: 64 }}>🏋️</div>
            <h3 style={{ color: '#475569', fontSize: 18, marginTop: 16 }}>
              Escolha a cidade e clique Buscar
            </h3>
            <p style={{ color: '#334155', marginTop: 8 }}>
              O scraper entra em cada academia e pega o telefone
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

const labelStyle = { fontSize: 11, color: '#94a3b8', marginBottom: 4, display: 'block', fontWeight: 600 };
const inputStyle = {
  width: '100%', padding: '10px 14px', background: '#0f172a', border: '1px solid #475569',
  borderRadius: 8, color: '#fff', textAlign: 'left', cursor: 'pointer', fontSize: 14, outline: 'none',
};
const btnStyle = {
  padding: '10px 24px', background: '#e11d48', color: '#fff', border: 'none',
  borderRadius: 8, cursor: 'pointer', fontSize: 14, fontWeight: 700, whiteSpace: 'nowrap',
};
const dlBtn = {
  padding: '6px 16px', color: '#fff', border: 'none',
  borderRadius: 8, cursor: 'pointer', fontSize: 13, fontWeight: 600,
};
const th = {
  padding: '10px 12px', textAlign: 'left', color: '#94a3b8', fontWeight: 600,
  fontSize: 12, textTransform: 'uppercase', borderBottom: '2px solid #334155',
};
const td = { padding: '10px 12px', verticalAlign: 'top', fontSize: 14 };
