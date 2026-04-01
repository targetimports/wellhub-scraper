import { useState, useRef } from 'react';
import { resolverBusca, listarEstados, buscarParceiros, buscarDetalhes } from './api';

const estados = listarEstados();

export default function App() {
  const [modo, setModo] = useState('cidade'); // 'cidade' ou 'estado'
  const [cidade, setCidade] = useState('');
  const [uf, setUf] = useState('TODOS');
  const [termo, setTermo] = useState('');
  const [resultados, setResultados] = useState([]);
  const [loading, setLoading] = useState(false);
  const [progresso, setProgresso] = useState('');
  const [erro, setErro] = useState('');
  const abortRef = useRef(null);

  const buscar = async () => {
    let cidadesParaBuscar;

    if (modo === 'estado') {
      if (uf === 'TODOS') {
        // Juntar todas as cidades de todos os estados
        cidadesParaBuscar = [];
        for (const e of estados) {
          const dados = resolverBusca(e.uf);
          if (dados) cidadesParaBuscar.push(...dados.cidades);
        }
      } else {
        const dados = resolverBusca(uf);
        if (!dados) { setErro('Estado não encontrado'); return; }
        cidadesParaBuscar = dados.cidades;
      }
    } else {
      if (!cidade.trim()) { setErro('Digite uma cidade'); return; }
      const dados = resolverBusca(cidade);
      if (!dados) { setErro('Cidade não encontrada. Tente: Salvador, Feira de Santana, São Paulo...'); return; }
      cidadesParaBuscar = dados.cidades;
    }

    setLoading(true); setResultados([]); setErro('');
    const controller = new AbortController();
    abortRef.current = controller;
    const seenIds = new Set();

    try {
      // Buscar em cada cidade
      let allPartners = [];
      for (let ci = 0; ci < cidadesParaBuscar.length; ci++) {
        if (controller.signal.aborted) break;
        const c = cidadesParaBuscar[ci];
        setProgresso(`Buscando em ${c.nome} (${ci + 1}/${cidadesParaBuscar.length})...`);

        let offset = 0;
        while (offset < 500) {
          if (controller.signal.aborted) break;
          const data = await buscarParceiros(c.lat, c.lon, 20, offset, termo, controller.signal);
          if (!Array.isArray(data) || data.length === 0) break;
          for (const p of data) {
            if (!seenIds.has(p.id)) {
              seenIds.add(p.id);
              allPartners.push({ ...p, cidadeOrigem: c.nome });
            }
          }
          setProgresso(`${c.nome}: ${allPartners.length} academias no total...`);
          offset += 20;
          if (data.length < 20) break;
        }
      }

      if (controller.signal.aborted) return;
      if (allPartners.length === 0) { setErro('Nenhuma academia encontrada'); setLoading(false); return; }

      // Buscar telefones
      setProgresso(`${allPartners.length} academias! Buscando telefones...`);
      const finalResults = [];
      for (let i = 0; i < allPartners.length; i++) {
        if (controller.signal.aborted) break;
        const p = allPartners[i];
        setProgresso(`Telefone ${i + 1}/${allPartners.length}: ${p.name || '...'}`);
        try {
          const det = await buscarDetalhes(p.id, controller.signal);
          finalResults.push({
            nome: det.nome || p.name || '',
            telefone: det.telefone || '',
            endereco: p.fullAddress || det.endereco || '',
            cidade: p.cidadeOrigem || '',
            id: p.id,
          });
        } catch {
          finalResults.push({ nome: p.name || '', telefone: '', endereco: p.fullAddress || '', cidade: p.cidadeOrigem || '', id: p.id });
        }
        setResultados([...finalResults]);
      }
      setProgresso('');
    } catch (err) {
      if (err.name !== 'AbortError') setErro(err.message);
    } finally { setLoading(false); }
  };

  const parar = () => { abortRef.current?.abort(); setLoading(false); setProgresso(''); };

  const exportarCSV = () => {
    if (!resultados.length) return;
    const rows = [['Nome', 'Telefone', 'Cidade', 'Endereco']];
    resultados.forEach(r => rows.push([r.nome, r.telefone, r.cidade, r.endereco.replace(/"/g, '""')]));
    const label = modo === 'estado' ? uf : cidade;
    dl('\ufeff' + rows.map(r => r.map(c => `"${c}"`).join(',')).join('\n'), `academias_${label}.csv`, 'text/csv;charset=utf-8;');
  };

  const exportarJSON = () => {
    if (!resultados.length) return;
    const label = modo === 'estado' ? uf : cidade;
    dl(JSON.stringify(resultados, null, 2), `academias_${label}.json`, 'application/json');
  };

  const dl = (content, name, type) => {
    const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([content], { type }));
    a.download = name.replace(/\s/g, '_'); a.click();
  };

  const comTel = resultados.filter(r => r.telefone);
  const label = modo === 'estado' ? uf : cidade;

  return (
    <div style={{ minHeight: '100vh', background: '#0f172a', color: '#e2e8f0', fontFamily: 'system-ui, sans-serif' }}>
      <div style={{ background: 'linear-gradient(135deg, #e11d48, #9333ea)', padding: '28px 0' }}>
        <div style={{ maxWidth: 960, margin: '0 auto', padding: '0 20px' }}>
          <h1 style={{ fontSize: 26, fontWeight: 800, color: '#fff', margin: 0 }}>🏋️ Wellhub Scraper</h1>
          <p style={{ color: '#fecdd3', margin: '4px 0 0', fontSize: 14 }}>Busca nome e telefone de academias por cidade ou estado inteiro</p>
        </div>
      </div>

      <div style={{ maxWidth: 960, margin: '-16px auto 0', padding: '0 20px' }}>
        <div style={{ background: '#1e293b', borderRadius: 16, padding: 20, border: '1px solid #334155', boxShadow: '0 20px 40px rgba(0,0,0,0.4)' }}>

          {/* Toggle cidade/estado */}
          <div style={{ display: 'flex', gap: 4, marginBottom: 14 }}>
            <button onClick={() => setModo('cidade')}
              style={{ padding: '6px 16px', borderRadius: 6, border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 600,
                background: modo === 'cidade' ? '#e11d48' : '#334155', color: '#fff' }}>
              📍 Por Cidade
            </button>
            <button onClick={() => setModo('estado')}
              style={{ padding: '6px 16px', borderRadius: 6, border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 600,
                background: modo === 'estado' ? '#e11d48' : '#334155', color: '#fff' }}>
              🗺️ Estado Inteiro
            </button>
          </div>

          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>

            {/* Cidade OU Estado */}
            {modo === 'cidade' ? (
              <div style={{ flex: '1 1 250px' }}>
                <label style={labelStyle}>📍 Cidade</label>
                <input type="text" value={cidade} onChange={e => setCidade(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && !loading && buscar()}
                  placeholder="Ex: Feira de Santana, Salvador..."
                  style={{ ...inputStyle, boxSizing: 'border-box', width: '100%' }} />
              </div>
            ) : (
              <div style={{ flex: '1 1 250px' }}>
                <label style={labelStyle}>🗺️ Estado (busca todas as cidades)</label>
                <select value={uf} onChange={e => setUf(e.target.value)}
                  style={{ ...inputStyle, cursor: 'pointer', appearance: 'auto' }}>
                  <option value="TODOS">🇧🇷 TODO BRASIL - {estados.reduce((s, e) => s + e.totalCidades, 0)} cidades</option>
                  {estados.map(e => (
                    <option key={e.uf} value={e.uf}>{e.uf} - {e.totalCidades} cidades</option>
                  ))}
                </select>
              </div>
            )}

            {/* Tipo */}
            <div style={{ flex: '1 1 180px' }}>
              <label style={labelStyle}>🔍 Tipo (opcional)</label>
              <input type="text" value={termo} onChange={e => setTermo(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && !loading && buscar()}
                placeholder="academia, crossfit, yoga..."
                style={{ ...inputStyle, boxSizing: 'border-box', width: '100%' }} />
            </div>

            {/* Botão */}
            <div style={{ display: 'flex', alignItems: 'flex-end' }}>
              {loading
                ? <button onClick={parar} style={{ ...btnStyle, background: '#dc2626' }}>⏹ Parar</button>
                : <button onClick={buscar} style={btnStyle}>🔍 Buscar</button>}
            </div>
          </div>

          {progresso && <p style={{ marginTop: 10, color: '#fbbf24', fontSize: 13 }}>⏳ {progresso}</p>}
          {erro && <p style={{ marginTop: 10, color: '#f87171', fontSize: 13 }}>❌ {erro}</p>}
        </div>
      </div>

      <div style={{ maxWidth: 960, margin: '0 auto', padding: '20px 20px 60px' }}>
        {resultados.length > 0 && (
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, flexWrap: 'wrap', gap: 10 }}>
            <div>
              <span style={{ color: '#fff', fontWeight: 700, fontSize: 18 }}>{resultados.length}</span>
              <span style={{ color: '#94a3b8' }}> academias em </span>
              <span style={{ color: '#fb7185' }}>{label}</span>
              {comTel.length > 0 && <span style={{ color: '#34d399', marginLeft: 8 }}>({comTel.length} com telefone)</span>}
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={exportarCSV} style={{ ...dlBtnStyle, background: '#059669' }}>📥 CSV</button>
              <button onClick={exportarJSON} style={{ ...dlBtnStyle, background: '#2563eb' }}>📥 JSON</button>
            </div>
          </div>
        )}

        {resultados.length > 0 && (
          <div style={{ borderRadius: 12, border: '1px solid #334155', overflow: 'hidden', overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead><tr style={{ background: '#1e293b' }}>
                <th style={th}>#</th><th style={th}>Nome</th><th style={th}>Telefone</th>
                {modo === 'estado' && <th style={th}>Cidade</th>}
                <th style={th}>Endereço</th>
              </tr></thead>
              <tbody>
                {resultados.map((r, i) => (
                  <tr key={r.id || i} style={{ borderBottom: '1px solid #1e293b', background: i % 2 === 0 ? '#0f172a' : '#111827' }}>
                    <td style={td}>{i + 1}</td>
                    <td style={{ ...td, color: '#fff', fontWeight: 600 }}>{r.nome || '-'}</td>
                    <td style={td}>{r.telefone
                      ? <a href={`tel:${r.telefone}`} style={{ color: '#34d399', textDecoration: 'none', fontWeight: 600 }}>📞 {r.telefone}</a>
                      : <span style={{ color: '#475569' }}>—</span>}</td>
                    {modo === 'estado' && <td style={{ ...td, color: '#fb7185', fontSize: 13 }}>{r.cidade}</td>}
                    <td style={{ ...td, color: '#94a3b8', fontSize: 13 }}>{r.endereco || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {!loading && resultados.length === 0 && !erro && (
          <div style={{ textAlign: 'center', padding: '80px 20px' }}>
            <div style={{ fontSize: 64 }}>🏋️</div>
            <h3 style={{ color: '#475569', fontSize: 18, marginTop: 16 }}>Escolha cidade ou estado inteiro e clique Buscar</h3>
            <p style={{ color: '#334155', marginTop: 8 }}>Estado inteiro busca em todas as cidades do estado</p>
          </div>
        )}
      </div>
    </div>
  );
}

const labelStyle = { fontSize: 11, color: '#94a3b8', marginBottom: 4, display: 'block', fontWeight: 600 };
const inputStyle = { width: '100%', padding: '10px 14px', background: '#0f172a', border: '1px solid #475569', borderRadius: 8, color: '#fff', fontSize: 14, outline: 'none' };
const btnStyle = { padding: '10px 24px', background: '#e11d48', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', fontSize: 14, fontWeight: 700, whiteSpace: 'nowrap' };
const dlBtnStyle = { padding: '6px 16px', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', fontSize: 13, fontWeight: 600 };
const th = { padding: '10px 12px', textAlign: 'left', color: '#94a3b8', fontWeight: 600, fontSize: 12, textTransform: 'uppercase', borderBottom: '2px solid #334155' };
const td = { padding: '10px 12px', verticalAlign: 'top', fontSize: 14 };
