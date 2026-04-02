import { useState, useRef, useEffect } from 'react';
import { resolverBusca, buscarParceiros, buscarDetalhes, salvarNoSupabase } from './api';

const UF_NOMES = {
  AC:'Acre',AL:'Alagoas',AP:'Amapá',AM:'Amazonas',BA:'Bahia',CE:'Ceará',
  DF:'Distrito Federal',ES:'Espírito Santo',GO:'Goiás',MA:'Maranhão',
  MT:'Mato Grosso',MS:'Mato Grosso do Sul',MG:'Minas Gerais',PA:'Pará',
  PB:'Paraíba',PR:'Paraná',PE:'Pernambuco',PI:'Piauí',RJ:'Rio de Janeiro',
  RN:'Rio Grande do Norte',RS:'Rio Grande do Sul',RO:'Rondônia',RR:'Roraima',
  SC:'Santa Catarina',SP:'São Paulo',SE:'Sergipe',TO:'Tocantins'
};

export default function App() {
  const [modo, setModo] = useState('estado');
  const [cidade, setCidade] = useState('');
  const [uf, setUf] = useState('BA');
  const [termo, setTermo] = useState('');
  const [resultados, setResultados] = useState([]);
  const [loading, setLoading] = useState(false);
  const [progresso, setProgresso] = useState('');
  const [erro, setErro] = useState('');
  const [supaUrl, setSupaUrl] = useState(localStorage.getItem('supa_url') || '');
  const [supaKey, setSupaKey] = useState(localStorage.getItem('supa_key') || '');
  const [showConfig, setShowConfig] = useState(false);
  const [salvando, setSalvando] = useState('');
  const abortRef = useRef(null);

  useEffect(() => {
    if (supaUrl) localStorage.setItem('supa_url', supaUrl);
    if (supaKey) localStorage.setItem('supa_key', supaKey);
  }, [supaUrl, supaKey]);

  const buscar = async () => {
    let dados;
    if (modo === 'estado') {
      dados = resolverBusca(uf);
    } else {
      if (!cidade.trim()) { setErro('Digite uma cidade'); return; }
      dados = resolverBusca(cidade);
      if (!dados) { setErro('Cidade não encontrada'); return; }
    }
    if (!dados || dados.pontos.length === 0) { setErro('Nenhum ponto de busca'); return; }

    setLoading(true); setResultados([]); setErro('');
    const controller = new AbortController();
    abortRef.current = controller;
    const seenIds = new Set();

    try {
      let allPartners = [];
      const total = dados.pontos.length;

      for (let pi = 0; pi < total; pi++) {
        if (controller.signal.aborted) break;
        const pt = dados.pontos[pi];
        const pct = Math.round((pi / total) * 100);
        setProgresso(`Varrendo ${pct}% (ponto ${pi + 1}/${total}) | ${allPartners.length} academias`);

        let offset = 0;
        while (offset < 500) {
          if (controller.signal.aborted) break;
          try {
            const data = await buscarParceiros(pt.lat, pt.lon, 20, offset, termo, controller.signal);
            if (!Array.isArray(data) || data.length === 0) break;
            for (const p of data) {
              if (!seenIds.has(p.id)) { seenIds.add(p.id); allPartners.push(p); }
            }
            offset += 20;
            if (data.length < 20) break;
          } catch (e) {
            if (e.name === 'AbortError') throw e;
            break; // pular ponto com erro
          }
        }

        // Atualizar resultados parciais a cada 10 pontos
        if (pi % 10 === 0) {
          setResultados(allPartners.map(p => ({
            nome: p.name || '', telefone: '', endereco: p.fullAddress || '', id: p.id
          })));
        }
      }

      if (controller.signal.aborted) return;
      if (allPartners.length === 0) { setErro('Nenhuma academia encontrada'); setLoading(false); return; }

      // Mostrar todos antes de buscar telefones
      setResultados(allPartners.map(p => ({
        nome: p.name || '', telefone: '', endereco: p.fullAddress || '', id: p.id
      })));

      setProgresso(`${allPartners.length} academias! Buscando telefones...`);
      const finalResults = [];
      for (let i = 0; i < allPartners.length; i++) {
        if (controller.signal.aborted) break;
        const p = allPartners[i];
        if (i % 5 === 0) setProgresso(`Telefone ${i + 1}/${allPartners.length} (${Math.round(i/allPartners.length*100)}%)`);
        try {
          const det = await buscarDetalhes(p.id, controller.signal);
          finalResults.push({ nome: det.nome || p.name || '', telefone: det.telefone || '', endereco: p.fullAddress || det.endereco || '', id: p.id });
        } catch {
          finalResults.push({ nome: p.name || '', telefone: '', endereco: p.fullAddress || '', id: p.id });
        }
        if (i % 20 === 0) setResultados([...finalResults]);
      }
      setResultados(finalResults);
      setProgresso('');
    } catch (err) {
      if (err.name !== 'AbortError') setErro(err.message);
    } finally { setLoading(false); }
  };

  const parar = () => { abortRef.current?.abort(); setLoading(false); setProgresso(''); };

  const salvarBD = async () => {
    if (!supaUrl || !supaKey) { setShowConfig(true); setErro('Configure o Supabase primeiro'); return; }
    if (!resultados.length) return;
    setSalvando('Salvando...');
    try {
      const estado = modo === 'estado' ? uf : '';
      const { total, erros } = await salvarNoSupabase(supaUrl, supaKey, resultados, estado);
      if (erros.length) {
        setSalvando(`Salvo com erros: ${erros[0]}`);
      } else {
        setSalvando(`${total} academias salvas no Supabase!`);
      }
      setTimeout(() => setSalvando(''), 5000);
    } catch (e) {
      setSalvando(`Erro: ${e.message}`);
    }
  };

  const label = modo === 'estado' ? (UF_NOMES[uf] || uf) : cidade;

  const exportarCSV = () => {
    if (!resultados.length) return;
    const rows = [['Nome', 'Telefone', 'Endereco']];
    resultados.forEach(r => rows.push([r.nome, r.telefone, r.endereco.replace(/"/g, '""')]));
    dl('\ufeff' + rows.map(r => r.map(c => `"${c}"`).join(',')).join('\n'), `academias_${label}.csv`, 'text/csv;charset=utf-8;');
  };
  const exportarJSON = () => {
    if (!resultados.length) return;
    dl(JSON.stringify(resultados, null, 2), `academias_${label}.json`, 'application/json');
  };
  const dl = (c, n, t) => { const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([c], { type: t })); a.download = n.replace(/\s/g, '_'); a.click(); };

  const comTel = resultados.filter(r => r.telefone);

  return (
    <div style={{ minHeight: '100vh', background: '#0f172a', color: '#e2e8f0', fontFamily: 'system-ui, sans-serif' }}>
      <div style={{ background: 'linear-gradient(135deg, #e11d48, #9333ea)', padding: '24px 0' }}>
        <div style={{ maxWidth: 960, margin: '0 auto', padding: '0 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1 style={{ fontSize: 24, fontWeight: 800, color: '#fff', margin: 0 }}>🏋️ Wellhub Scraper</h1>
            <p style={{ color: '#fecdd3', margin: '2px 0 0', fontSize: 13 }}>Varre o estado INTEIRO - grade de ~20km</p>
          </div>
          <button onClick={() => setShowConfig(!showConfig)} style={{ padding: '6px 14px', background: '#ffffff20', color: '#fff', border: '1px solid #ffffff40', borderRadius: 8, cursor: 'pointer', fontSize: 12 }}>
            ⚙️ Supabase
          </button>
        </div>
      </div>

      {/* Config Supabase */}
      {showConfig && (
        <div style={{ maxWidth: 960, margin: '10px auto', padding: '0 20px' }}>
          <div style={{ background: '#1a1a2e', borderRadius: 12, padding: 16, border: '1px solid #334155' }}>
            <p style={{ margin: '0 0 10px', fontSize: 13, color: '#94a3b8' }}>⚙️ Configurar Supabase para salvar no BD</p>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <input type="text" value={supaUrl} onChange={e => setSupaUrl(e.target.value)} placeholder="https://xxx.supabase.co"
                style={{ ...inputStyle, flex: '1 1 250px', boxSizing: 'border-box' }} />
              <input type="password" value={supaKey} onChange={e => setSupaKey(e.target.value)} placeholder="anon key"
                style={{ ...inputStyle, flex: '1 1 250px', boxSizing: 'border-box' }} />
            </div>
            <p style={{ margin: '8px 0 0', fontSize: 11, color: '#475569' }}>Rode o SQL do arquivo supabase_table.sql no Supabase primeiro</p>
          </div>
        </div>
      )}

      <div style={{ maxWidth: 960, margin: '12px auto 0', padding: '0 20px' }}>
        <div style={{ background: '#1e293b', borderRadius: 16, padding: 20, border: '1px solid #334155', boxShadow: '0 20px 40px rgba(0,0,0,0.4)' }}>
          <div style={{ display: 'flex', gap: 4, marginBottom: 14 }}>
            <button onClick={() => setModo('cidade')} style={{ padding: '6px 16px', borderRadius: 6, border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 600, background: modo === 'cidade' ? '#e11d48' : '#334155', color: '#fff' }}>📍 Cidade</button>
            <button onClick={() => setModo('estado')} style={{ padding: '6px 16px', borderRadius: 6, border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 600, background: modo === 'estado' ? '#e11d48' : '#334155', color: '#fff' }}>🗺️ Estado Inteiro</button>
          </div>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            {modo === 'cidade' ? (
              <div style={{ flex: '1 1 250px' }}>
                <label style={labelStyle}>📍 Cidade</label>
                <input type="text" value={cidade} onChange={e => setCidade(e.target.value)} onKeyDown={e => e.key === 'Enter' && !loading && buscar()}
                  placeholder="Ex: Feira de Santana, Salvador..." style={{ ...inputStyle, boxSizing: 'border-box', width: '100%' }} />
              </div>
            ) : (
              <div style={{ flex: '1 1 250px' }}>
                <label style={labelStyle}>🗺️ Estado (varre TUDO ~20km)</label>
                <select value={uf} onChange={e => setUf(e.target.value)} style={{ ...inputStyle, cursor: 'pointer', appearance: 'auto' }}>
                  {Object.entries(UF_NOMES).sort((a,b) => a[1].localeCompare(b[1])).map(([k, v]) => (
                    <option key={k} value={k}>{v}</option>
                  ))}
                </select>
              </div>
            )}
            <div style={{ flex: '1 1 160px' }}>
              <label style={labelStyle}>🔍 Tipo (opcional)</label>
              <input type="text" value={termo} onChange={e => setTermo(e.target.value)} onKeyDown={e => e.key === 'Enter' && !loading && buscar()}
                placeholder="academia, crossfit..." style={{ ...inputStyle, boxSizing: 'border-box', width: '100%' }} />
            </div>
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

      <div style={{ maxWidth: 960, margin: '0 auto', padding: '16px 20px 60px' }}>
        {resultados.length > 0 && (
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, flexWrap: 'wrap', gap: 8 }}>
            <div>
              <span style={{ color: '#fff', fontWeight: 700, fontSize: 18 }}>{resultados.length}</span>
              <span style={{ color: '#94a3b8' }}> academias em </span>
              <span style={{ color: '#fb7185' }}>{label}</span>
              {comTel.length > 0 && <span style={{ color: '#34d399', marginLeft: 8 }}>({comTel.length} com tel)</span>}
            </div>
            <div style={{ display: 'flex', gap: 6 }}>
              <button onClick={exportarCSV} style={{ ...dlBtnS, background: '#059669' }}>📥 CSV</button>
              <button onClick={exportarJSON} style={{ ...dlBtnS, background: '#2563eb' }}>📥 JSON</button>
              <button onClick={salvarBD} style={{ ...dlBtnS, background: '#7c3aed' }}>💾 Supabase</button>
            </div>
          </div>
        )}
        {salvando && <p style={{ color: '#a78bfa', fontSize: 13, marginBottom: 8 }}>💾 {salvando}</p>}

        {resultados.length > 0 && (
          <div style={{ borderRadius: 12, border: '1px solid #334155', overflow: 'hidden', overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead><tr style={{ background: '#1e293b' }}>
                <th style={th}>#</th><th style={th}>Nome</th><th style={th}>Telefone</th><th style={th}>Endereço</th>
              </tr></thead>
              <tbody>
                {resultados.map((r, i) => (
                  <tr key={r.id || i} style={{ borderBottom: '1px solid #1e293b', background: i % 2 === 0 ? '#0f172a' : '#111827' }}>
                    <td style={td}>{i + 1}</td>
                    <td style={{ ...td, color: '#fff', fontWeight: 600 }}>{r.nome || '-'}</td>
                    <td style={td}>{r.telefone ? <a href={`tel:${r.telefone}`} style={{ color: '#34d399', textDecoration: 'none', fontWeight: 600 }}>📞 {r.telefone}</a> : <span style={{ color: '#475569' }}>—</span>}</td>
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
            <h3 style={{ color: '#475569', fontSize: 18, marginTop: 16 }}>Selecione estado e clique Buscar</h3>
            <p style={{ color: '#334155', marginTop: 8 }}>Grade de ~20km cobre TODAS as cidades do estado</p>
          </div>
        )}
      </div>
    </div>
  );
}

const labelStyle = { fontSize: 11, color: '#94a3b8', marginBottom: 4, display: 'block', fontWeight: 600 };
const inputStyle = { width: '100%', padding: '10px 14px', background: '#0f172a', border: '1px solid #475569', borderRadius: 8, color: '#fff', fontSize: 14, outline: 'none' };
const btnStyle = { padding: '10px 24px', background: '#e11d48', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', fontSize: 14, fontWeight: 700, whiteSpace: 'nowrap' };
const dlBtnS = { padding: '6px 14px', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', fontSize: 12, fontWeight: 600 };
const th = { padding: '10px 12px', textAlign: 'left', color: '#94a3b8', fontWeight: 600, fontSize: 12, textTransform: 'uppercase', borderBottom: '2px solid #334155' };
const td = { padding: '10px 12px', verticalAlign: 'top', fontSize: 14 };
