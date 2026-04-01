import { useState, useRef } from 'react';

const ESTADOS = [
  {
    uf: 'SP', nome: 'São Paulo', cidades: [
      { nome: 'São Paulo', lat: -23.5505, lon: -46.6333 },
      { nome: 'Campinas', lat: -22.9099, lon: -47.0626 },
      { nome: 'Santos', lat: -23.9608, lon: -46.3336 },
      { nome: 'Guarulhos', lat: -23.4538, lon: -46.5333 },
      { nome: 'São Bernardo do Campo', lat: -23.6914, lon: -46.5646 },
      { nome: 'Osasco', lat: -23.5325, lon: -46.7917 },
      { nome: 'Sorocaba', lat: -23.5015, lon: -47.4526 },
      { nome: 'Ribeirão Preto', lat: -21.1704, lon: -47.8103 },
      { nome: 'São José dos Campos', lat: -23.1896, lon: -45.8841 },
      { nome: 'Santo André', lat: -23.6737, lon: -46.5432 },
      { nome: 'Bauru', lat: -22.3246, lon: -49.0871 },
      { nome: 'Piracicaba', lat: -22.7338, lon: -47.6476 },
      { nome: 'Jundiaí', lat: -23.1857, lon: -46.8978 },
      { nome: 'São José do Rio Preto', lat: -20.8113, lon: -49.3758 },
      { nome: 'Mogi das Cruzes', lat: -23.5229, lon: -46.1856 },
      { nome: 'Taubaté', lat: -23.0204, lon: -45.5558 },
      { nome: 'Franca', lat: -20.5390, lon: -47.4008 },
      { nome: 'Presidente Prudente', lat: -22.1256, lon: -51.3889 },
      { nome: 'Marília', lat: -22.2139, lon: -49.9458 },
      { nome: 'Araraquara', lat: -21.7946, lon: -48.1756 },
    ]
  },
  {
    uf: 'RJ', nome: 'Rio de Janeiro', cidades: [
      { nome: 'Rio de Janeiro', lat: -22.9068, lon: -43.1729 },
      { nome: 'Niterói', lat: -22.8833, lon: -43.1036 },
      { nome: 'São Gonçalo', lat: -22.8269, lon: -43.0539 },
      { nome: 'Duque de Caxias', lat: -22.7856, lon: -43.3117 },
      { nome: 'Nova Iguaçu', lat: -22.7592, lon: -43.4510 },
      { nome: 'Petrópolis', lat: -22.5046, lon: -43.1787 },
      { nome: 'Volta Redonda', lat: -22.5023, lon: -44.1044 },
      { nome: 'Campos dos Goytacazes', lat: -21.7523, lon: -41.3305 },
      { nome: 'Macaé', lat: -22.3714, lon: -41.7869 },
      { nome: 'Cabo Frio', lat: -22.8789, lon: -42.0189 },
    ]
  },
  {
    uf: 'MG', nome: 'Minas Gerais', cidades: [
      { nome: 'Belo Horizonte', lat: -19.9167, lon: -43.9345 },
      { nome: 'Uberlândia', lat: -18.9186, lon: -48.2772 },
      { nome: 'Contagem', lat: -19.9320, lon: -44.0539 },
      { nome: 'Juiz de Fora', lat: -21.7642, lon: -43.3503 },
      { nome: 'Betim', lat: -19.9678, lon: -44.1983 },
      { nome: 'Montes Claros', lat: -16.7350, lon: -43.8615 },
      { nome: 'Uberaba', lat: -19.7472, lon: -47.9318 },
      { nome: 'Governador Valadares', lat: -18.8509, lon: -41.9494 },
      { nome: 'Ipatinga', lat: -19.4684, lon: -42.5367 },
      { nome: 'Poços de Caldas', lat: -21.7878, lon: -46.5613 },
    ]
  },
  {
    uf: 'RS', nome: 'Rio Grande do Sul', cidades: [
      { nome: 'Porto Alegre', lat: -30.0346, lon: -51.2177 },
      { nome: 'Caxias do Sul', lat: -29.1681, lon: -51.1794 },
      { nome: 'Pelotas', lat: -31.7649, lon: -52.3371 },
      { nome: 'Canoas', lat: -29.9178, lon: -51.1740 },
      { nome: 'Santa Maria', lat: -29.6842, lon: -53.8069 },
      { nome: 'Novo Hamburgo', lat: -29.6787, lon: -51.1306 },
      { nome: 'Gravataí', lat: -29.9447, lon: -50.9920 },
      { nome: 'Passo Fundo', lat: -28.2624, lon: -52.4068 },
    ]
  },
  {
    uf: 'PR', nome: 'Paraná', cidades: [
      { nome: 'Curitiba', lat: -25.4284, lon: -49.2733 },
      { nome: 'Londrina', lat: -23.3045, lon: -51.1696 },
      { nome: 'Maringá', lat: -23.4205, lon: -51.9333 },
      { nome: 'Ponta Grossa', lat: -25.0945, lon: -50.1633 },
      { nome: 'Cascavel', lat: -24.9573, lon: -53.4593 },
      { nome: 'São José dos Pinhais', lat: -25.5369, lon: -49.2063 },
      { nome: 'Foz do Iguaçu', lat: -25.5163, lon: -54.5854 },
    ]
  },
  {
    uf: 'SC', nome: 'Santa Catarina', cidades: [
      { nome: 'Florianópolis', lat: -27.5954, lon: -48.5480 },
      { nome: 'Joinville', lat: -26.3045, lon: -48.8487 },
      { nome: 'Blumenau', lat: -26.9194, lon: -49.0661 },
      { nome: 'Chapecó', lat: -27.1006, lon: -52.6155 },
      { nome: 'Balneário Camboriú', lat: -26.9906, lon: -48.6352 },
      { nome: 'Criciúma', lat: -28.6775, lon: -49.3697 },
      { nome: 'Itajaí', lat: -26.9078, lon: -48.6616 },
    ]
  },
  {
    uf: 'BA', nome: 'Bahia', cidades: [
      { nome: 'Salvador', lat: -12.9714, lon: -38.5124 },
      { nome: 'Feira de Santana', lat: -12.2669, lon: -38.9666 },
      { nome: 'Vitória da Conquista', lat: -14.8619, lon: -40.8444 },
      { nome: 'Camaçari', lat: -12.6996, lon: -38.3263 },
      { nome: 'Ilhéus', lat: -14.7936, lon: -39.0464 },
      { nome: 'Lauro de Freitas', lat: -12.8978, lon: -38.3213 },
    ]
  },
  {
    uf: 'PE', nome: 'Pernambuco', cidades: [
      { nome: 'Recife', lat: -8.0476, lon: -34.877 },
      { nome: 'Jaboatão dos Guararapes', lat: -8.1130, lon: -35.0156 },
      { nome: 'Olinda', lat: -8.0089, lon: -34.8553 },
      { nome: 'Caruaru', lat: -8.2823, lon: -35.9761 },
      { nome: 'Petrolina', lat: -9.3891, lon: -40.5003 },
    ]
  },
  {
    uf: 'CE', nome: 'Ceará', cidades: [
      { nome: 'Fortaleza', lat: -3.7172, lon: -38.5433 },
      { nome: 'Caucaia', lat: -3.7367, lon: -38.6531 },
      { nome: 'Juazeiro do Norte', lat: -7.2131, lon: -39.3153 },
      { nome: 'Maracanaú', lat: -3.8768, lon: -38.6255 },
      { nome: 'Sobral', lat: -3.6861, lon: -40.3482 },
    ]
  },
  {
    uf: 'GO', nome: 'Goiás', cidades: [
      { nome: 'Goiânia', lat: -16.6869, lon: -49.2648 },
      { nome: 'Aparecida de Goiânia', lat: -16.8198, lon: -49.2469 },
      { nome: 'Anápolis', lat: -16.3281, lon: -48.9529 },
      { nome: 'Rio Verde', lat: -17.7928, lon: -50.9192 },
    ]
  },
  {
    uf: 'DF', nome: 'Distrito Federal', cidades: [
      { nome: 'Brasília', lat: -15.7975, lon: -47.8919 },
      { nome: 'Taguatinga', lat: -15.8362, lon: -48.0558 },
      { nome: 'Ceilândia', lat: -15.8180, lon: -48.1087 },
    ]
  },
  {
    uf: 'PA', nome: 'Pará', cidades: [
      { nome: 'Belém', lat: -1.4558, lon: -48.5024 },
      { nome: 'Ananindeua', lat: -1.3659, lon: -48.3886 },
      { nome: 'Santarém', lat: -2.4430, lon: -54.7080 },
      { nome: 'Marabá', lat: -5.3685, lon: -49.1178 },
    ]
  },
  {
    uf: 'AM', nome: 'Amazonas', cidades: [
      { nome: 'Manaus', lat: -3.1190, lon: -60.0217 },
    ]
  },
  {
    uf: 'MA', nome: 'Maranhão', cidades: [
      { nome: 'São Luís', lat: -2.5297, lon: -44.2825 },
      { nome: 'Imperatriz', lat: -5.5190, lon: -47.4735 },
    ]
  },
  {
    uf: 'ES', nome: 'Espírito Santo', cidades: [
      { nome: 'Vitória', lat: -20.3155, lon: -40.3128 },
      { nome: 'Vila Velha', lat: -20.3297, lon: -40.2925 },
      { nome: 'Serra', lat: -20.1209, lon: -40.3075 },
      { nome: 'Cariacica', lat: -20.2636, lon: -40.4164 },
    ]
  },
  {
    uf: 'RN', nome: 'Rio Grande do Norte', cidades: [
      { nome: 'Natal', lat: -5.7945, lon: -35.211 },
      { nome: 'Mossoró', lat: -5.1878, lon: -37.3441 },
      { nome: 'Parnamirim', lat: -5.9116, lon: -35.2363 },
    ]
  },
  {
    uf: 'PB', nome: 'Paraíba', cidades: [
      { nome: 'João Pessoa', lat: -7.1195, lon: -34.8450 },
      { nome: 'Campina Grande', lat: -7.2307, lon: -35.8817 },
    ]
  },
  {
    uf: 'AL', nome: 'Alagoas', cidades: [
      { nome: 'Maceió', lat: -9.6658, lon: -35.7353 },
      { nome: 'Arapiraca', lat: -9.7522, lon: -36.6611 },
    ]
  },
  {
    uf: 'SE', nome: 'Sergipe', cidades: [
      { nome: 'Aracaju', lat: -10.9111, lon: -37.0717 },
    ]
  },
  {
    uf: 'PI', nome: 'Piauí', cidades: [
      { nome: 'Teresina', lat: -5.0892, lon: -42.8019 },
    ]
  },
  {
    uf: 'MT', nome: 'Mato Grosso', cidades: [
      { nome: 'Cuiabá', lat: -15.6014, lon: -56.0979 },
      { nome: 'Várzea Grande', lat: -15.6460, lon: -56.1325 },
      { nome: 'Rondonópolis', lat: -16.4673, lon: -54.6372 },
      { nome: 'Sinop', lat: -11.8642, lon: -55.5066 },
    ]
  },
  {
    uf: 'MS', nome: 'Mato Grosso do Sul', cidades: [
      { nome: 'Campo Grande', lat: -20.4697, lon: -54.6201 },
      { nome: 'Dourados', lat: -22.2233, lon: -54.8083 },
      { nome: 'Três Lagoas', lat: -20.7849, lon: -51.7008 },
    ]
  },
  {
    uf: 'TO', nome: 'Tocantins', cidades: [
      { nome: 'Palmas', lat: -10.1689, lon: -48.3317 },
    ]
  },
  {
    uf: 'RO', nome: 'Rondônia', cidades: [
      { nome: 'Porto Velho', lat: -8.7612, lon: -63.9004 },
      { nome: 'Ji-Paraná', lat: -10.8853, lon: -61.9517 },
    ]
  },
  {
    uf: 'AC', nome: 'Acre', cidades: [
      { nome: 'Rio Branco', lat: -9.9753, lon: -67.8100 },
    ]
  },
  {
    uf: 'AP', nome: 'Amapá', cidades: [
      { nome: 'Macapá', lat: 0.0349, lon: -51.0694 },
    ]
  },
  {
    uf: 'RR', nome: 'Roraima', cidades: [
      { nome: 'Boa Vista', lat: 2.8195, lon: -60.6714 },
    ]
  },
];

export default function App() {
  const [estadoAberto, setEstadoAberto] = useState(null);
  const [cidadeSelecionada, setCidadeSelecionada] = useState({ nome: 'São Paulo', lat: -23.5505, lon: -46.6333, uf: 'SP' });
  const [termo, setTermo] = useState('');
  const [resultados, setResultados] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [progresso, setProgresso] = useState('');
  const [erro, setErro] = useState('');
  const abortRef = useRef(null);

  const selecionarCidade = (estado, cidade) => {
    setCidadeSelecionada({ ...cidade, uf: estado.uf });
    setShowDropdown(false);
    setEstadoAberto(null);
  };

  const buscar = async () => {
    setLoading(true);
    setResultados([]);
    setErro('');

    const controller = new AbortController();
    abortRef.current = controller;

    try {
      // PASSO 1: buscar lista
      setProgresso('Buscando academias...');
      let allPartners = [];
      let offset = 0;

      while (offset < 500) {
        if (controller.signal.aborted) break;
        const params = new URLSearchParams({
          lat: String(cidadeSelecionada.lat), lon: String(cidadeSelecionada.lon),
          limit: '20', offset: String(offset),
        });
        if (termo) params.set('term', termo);

        const res = await fetch(`/api/search?${params}`, { signal: controller.signal });
        if (!res.ok) throw new Error(`Erro ${res.status}`);
        const data = await res.json();
        if (!Array.isArray(data) || data.length === 0) break;

        allPartners = [...allPartners, ...data];
        setProgresso(`${allPartners.length} academias encontradas...`);
        offset += 20;
        if (data.length < 20) break;
      }

      if (controller.signal.aborted) return;
      setProgresso(`${allPartners.length} academias! Buscando telefones (0/${allPartners.length})...`);

      // PASSO 2: entrar em cada pagina pra pegar telefone
      const finalResults = [];
      for (let i = 0; i < allPartners.length; i++) {
        if (controller.signal.aborted) break;
        const p = allPartners[i];
        setProgresso(`Buscando telefone ${i + 1}/${allPartners.length}: ${p.name || '...'}`);

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
          finalResults.push({ nome: p.name || '', telefone: '', endereco: p.fullAddress || '', id: p.id });
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

  const parar = () => { abortRef.current?.abort(); setLoading(false); setProgresso(''); };

  const exportarCSV = () => {
    if (!resultados.length) return;
    const rows = [['Nome', 'Telefone', 'Endereco']];
    resultados.forEach(r => rows.push([r.nome, r.telefone, r.endereco.replace(/"/g, '""')]));
    const csv = rows.map(r => r.map(c => `"${c}"`).join(',')).join('\n');
    dl('\ufeff' + csv, `academias_${cidadeSelecionada.nome}_${cidadeSelecionada.uf}.csv`, 'text/csv;charset=utf-8;');
  };

  const exportarJSON = () => {
    if (!resultados.length) return;
    dl(JSON.stringify(resultados, null, 2), `academias_${cidadeSelecionada.nome}_${cidadeSelecionada.uf}.json`, 'application/json');
  };

  const dl = (content, name, type) => {
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([content], { type }));
    a.download = name.replace(/\s/g, '_');
    a.click();
  };

  const comTel = resultados.filter(r => r.telefone);

  return (
    <div style={{ minHeight: '100vh', background: '#0f172a', color: '#e2e8f0', fontFamily: 'system-ui, sans-serif' }}>

      {/* HEADER */}
      <div style={{ background: 'linear-gradient(135deg, #e11d48, #9333ea)', padding: '28px 0' }}>
        <div style={{ maxWidth: 960, margin: '0 auto', padding: '0 20px' }}>
          <h1 style={{ fontSize: 26, fontWeight: 800, color: '#fff', margin: 0 }}>🏋️ Wellhub Scraper</h1>
          <p style={{ color: '#fecdd3', margin: '4px 0 0', fontSize: 14 }}>Busca nome e telefone de academias por estado e cidade</p>
        </div>
      </div>

      {/* BARRA DE PESQUISA */}
      <div style={{ maxWidth: 960, margin: '-16px auto 0', padding: '0 20px' }}>
        <div style={{ background: '#1e293b', borderRadius: 16, padding: 20, border: '1px solid #334155', boxShadow: '0 20px 40px rgba(0,0,0,0.4)' }}>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>

            {/* ESTADO + CIDADE DROPDOWN */}
            <div style={{ flex: '1 1 280px', position: 'relative' }}>
              <label style={labelStyle}>📍 Estado / Cidade</label>
              <button onClick={() => setShowDropdown(!showDropdown)} style={inputStyle}>
                {cidadeSelecionada.nome} - {cidadeSelecionada.uf} ▾
              </button>

              {showDropdown && (
                <div style={{
                  position: 'absolute', zIndex: 99, top: '100%', left: 0, right: 0, marginTop: 4,
                  background: '#1e293b', border: '1px solid #475569', borderRadius: 10,
                  maxHeight: 400, overflowY: 'auto', boxShadow: '0 10px 30px rgba(0,0,0,0.6)'
                }}>
                  {ESTADOS.map(estado => (
                    <div key={estado.uf}>
                      {/* ESTADO header */}
                      <button
                        onClick={() => setEstadoAberto(estadoAberto === estado.uf ? null : estado.uf)}
                        style={{
                          width: '100%', padding: '10px 16px', border: 'none', textAlign: 'left',
                          background: estadoAberto === estado.uf ? '#334155' : '#1e293b',
                          color: '#fff', cursor: 'pointer', fontSize: 14, fontWeight: 700,
                          borderBottom: '1px solid #262f3d', display: 'flex', justifyContent: 'space-between',
                        }}
                      >
                        <span>🏛️ {estado.nome}</span>
                        <span style={{ color: '#94a3b8', fontSize: 12 }}>
                          {estado.uf} {estadoAberto === estado.uf ? '▲' : '▼'}
                        </span>
                      </button>

                      {/* CIDADES do estado */}
                      {estadoAberto === estado.uf && estado.cidades.map(cidade => (
                        <button
                          key={`${estado.uf}-${cidade.nome}`}
                          onClick={() => selecionarCidade(estado, cidade)}
                          style={{
                            width: '100%', padding: '8px 16px 8px 36px', border: 'none', textAlign: 'left',
                            background: cidadeSelecionada.nome === cidade.nome && cidadeSelecionada.uf === estado.uf
                              ? '#e11d4830' : '#0f172a',
                            color: cidadeSelecionada.nome === cidade.nome && cidadeSelecionada.uf === estado.uf
                              ? '#fb7185' : '#94a3b8',
                            cursor: 'pointer', fontSize: 13, borderBottom: '1px solid #1a2332',
                          }}
                        >
                          📍 {cidade.nome}
                        </button>
                      ))}
                    </div>
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
      <div style={{ maxWidth: 960, margin: '0 auto', padding: '20px 20px 60px' }}>

        {resultados.length > 0 && (
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, flexWrap: 'wrap', gap: 10 }}>
            <div>
              <span style={{ color: '#fff', fontWeight: 700, fontSize: 18 }}>{resultados.length}</span>
              <span style={{ color: '#94a3b8' }}> academias em </span>
              <span style={{ color: '#fb7185' }}>{cidadeSelecionada.nome}/{cidadeSelecionada.uf}</span>
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
                        <a href={`tel:${r.telefone}`} style={{ color: '#34d399', textDecoration: 'none', fontWeight: 600 }}>📞 {r.telefone}</a>
                      ) : <span style={{ color: '#475569' }}>—</span>}
                    </td>
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
            <h3 style={{ color: '#475569', fontSize: 18, marginTop: 16 }}>Escolha Estado → Cidade e clique Buscar</h3>
            <p style={{ color: '#334155', marginTop: 8 }}>O scraper entra em cada academia e pega o telefone</p>
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
const dlBtnStyle = {
  padding: '6px 16px', color: '#fff', border: 'none',
  borderRadius: 8, cursor: 'pointer', fontSize: 13, fontWeight: 600,
};
const th = {
  padding: '10px 12px', textAlign: 'left', color: '#94a3b8', fontWeight: 600,
  fontSize: 12, textTransform: 'uppercase', borderBottom: '2px solid #334155',
};
const td = { padding: '10px 12px', verticalAlign: 'top', fontSize: 14 };
