import { useState, useRef } from 'react';
import { Search, MapPin, Download, Loader2, Dumbbell, Clock, Star, Phone, ExternalLink, ChevronDown } from 'lucide-react';

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
];

export default function App() {
  const [cidade, setCidade] = useState(CIDADES[0]);
  const [termo, setTermo] = useState('');
  const [resultados, setResultados] = useState([]);
  const [loading, setLoading] = useState(false);
  const [totalCarregado, setTotalCarregado] = useState(0);
  const [showCidades, setShowCidades] = useState(false);
  const [erro, setErro] = useState('');
  const abortRef = useRef(null);

  const buscar = async () => {
    setLoading(true);
    setResultados([]);
    setErro('');
    setTotalCarregado(0);

    const controller = new AbortController();
    abortRef.current = controller;

    try {
      let allResults = [];
      let offset = 0;
      const limit = 20;

      while (offset < 200) {
        if (controller.signal.aborted) break;

        const params = new URLSearchParams({
          lat: String(cidade.lat),
          lon: String(cidade.lon),
          limit: String(limit),
          offset: String(offset),
        });
        if (termo) params.set('term', termo);

        const res = await fetch(`/api/search?${params}`, { signal: controller.signal });
        if (!res.ok) throw new Error(`Erro ${res.status}`);

        const data = await res.json();
        if (!data || !Array.isArray(data) || data.length === 0) break;

        allResults = [...allResults, ...data];
        setResultados([...allResults]);
        setTotalCarregado(allResults.length);
        offset += limit;

        if (data.length < limit) break;
      }
    } catch (err) {
      if (err.name !== 'AbortError') {
        setErro(err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const parar = () => {
    if (abortRef.current) abortRef.current.abort();
  };

  const exportarCSV = () => {
    if (!resultados.length) return;

    const headers = ['Nome', 'Endereco', 'Atividades', 'Distancia (m)', 'Horario', 'Plano', 'Link'];
    const rows = resultados.map(r => [
      r.name || '',
      (r.fullAddress || '').replace(/,/g, ' -'),
      (r.activities || []).map(a => typeof a === 'object' ? a.name : a).join(' | '),
      r.distance || '',
      r.openingHours ? `${r.openingHours.opens}-${r.openingHours.closes}` : '',
      r.lowestPlan?.name || '',
      `https://wellhub.com/pt-br/search/partners/${r.id}/`,
    ]);

    const csv = [headers, ...rows].map(r => r.map(c => `"${c}"`).join(',')).join('\n');
    const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `wellhub_${cidade.nome.replace(/\s/g, '_')}_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const exportarJSON = () => {
    if (!resultados.length) return;
    const blob = new Blob([JSON.stringify(resultados, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `wellhub_${cidade.nome.replace(/\s/g, '_')}_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="bg-gradient-to-r from-rose-600 to-pink-600 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center gap-3">
            <Dumbbell className="w-8 h-8 text-white" />
            <div>
              <h1 className="text-2xl font-bold text-white">Wellhub Scraper</h1>
              <p className="text-rose-100 text-sm">Busque academias e parceiros Wellhub em qualquer cidade</p>
            </div>
          </div>
        </div>
      </header>

      {/* Search Bar */}
      <div className="max-w-7xl mx-auto px-4 -mt-6">
        <div className="bg-slate-800 rounded-xl shadow-2xl p-6 border border-slate-700">
          <div className="flex flex-col md:flex-row gap-3">
            {/* Cidade */}
            <div className="relative flex-1">
              <MapPin className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
              <button
                onClick={() => setShowCidades(!showCidades)}
                className="w-full pl-10 pr-10 py-3 bg-slate-900 border border-slate-600 rounded-lg text-left text-white hover:border-rose-500 transition-colors"
              >
                {cidade.nome}
              </button>
              <ChevronDown className="absolute right-3 top-3.5 w-4 h-4 text-slate-400" />
              {showCidades && (
                <div className="absolute z-50 mt-1 w-full bg-slate-900 border border-slate-600 rounded-lg shadow-xl max-h-60 overflow-y-auto">
                  {CIDADES.map(c => (
                    <button
                      key={c.nome}
                      onClick={() => { setCidade(c); setShowCidades(false); }}
                      className={`w-full px-4 py-2 text-left hover:bg-slate-700 transition-colors ${
                        c.nome === cidade.nome ? 'bg-rose-600/20 text-rose-400' : 'text-slate-300'
                      }`}
                    >
                      {c.nome}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Termo */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
              <input
                type="text"
                value={termo}
                onChange={e => setTermo(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && buscar()}
                placeholder="academia, crossfit, yoga, pilates..."
                className="w-full pl-10 pr-4 py-3 bg-slate-900 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:border-rose-500 focus:ring-1 focus:ring-rose-500 outline-none transition-colors"
              />
            </div>

            {/* Botao */}
            {loading ? (
              <button onClick={parar} className="px-8 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium flex items-center gap-2 transition-colors">
                <Loader2 className="w-5 h-5 animate-spin" /> Parar
              </button>
            ) : (
              <button onClick={buscar} className="px-8 py-3 bg-rose-600 hover:bg-rose-700 text-white rounded-lg font-medium flex items-center gap-2 transition-colors">
                <Search className="w-5 h-5" /> Buscar
              </button>
            )}
          </div>

          {erro && (
            <p className="mt-3 text-red-400 text-sm">{erro}</p>
          )}
        </div>
      </div>

      {/* Results */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Stats bar */}
        {resultados.length > 0 && (
          <div className="flex items-center justify-between mb-4">
            <p className="text-slate-400">
              <span className="text-white font-bold text-lg">{resultados.length}</span> parceiros encontrados em{' '}
              <span className="text-rose-400">{cidade.nome}</span>
              {loading && <span className="ml-2 text-yellow-400">(carregando...)</span>}
            </p>
            <div className="flex gap-2">
              <button onClick={exportarCSV} className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm flex items-center gap-2 transition-colors">
                <Download className="w-4 h-4" /> CSV
              </button>
              <button onClick={exportarJSON} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm flex items-center gap-2 transition-colors">
                <Download className="w-4 h-4" /> JSON
              </button>
            </div>
          </div>
        )}

        {/* Cards grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {resultados.map((r, i) => (
            <PartnerCard key={r.id || i} partner={r} index={i} />
          ))}
        </div>

        {/* Empty state */}
        {!loading && resultados.length === 0 && (
          <div className="text-center py-20">
            <Dumbbell className="w-16 h-16 text-slate-600 mx-auto mb-4" />
            <h3 className="text-xl text-slate-400">Selecione uma cidade e clique em Buscar</h3>
            <p className="text-slate-500 mt-2">Os resultados aparecem aqui com todos os detalhes</p>
          </div>
        )}
      </div>
    </div>
  );
}

function PartnerCard({ partner, index }) {
  const activities = (partner.activities || []).map(a => typeof a === 'object' ? a.name : a);
  const hours = partner.openingHours;
  const distance = partner.distance != null ? (Number(partner.distance) / 1000).toFixed(1) : null;
  const link = `https://wellhub.com/pt-br/search/partners/${partner.id}/`;

  return (
    <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden hover:border-rose-500/50 transition-all hover:shadow-lg hover:shadow-rose-500/10">
      {/* Image */}
      {partner.imageUrl && (
        <div className="h-40 overflow-hidden bg-slate-900">
          <img src={partner.imageUrl} alt={partner.name} className="w-full h-full object-cover" loading="lazy" />
        </div>
      )}

      <div className="p-4">
        {/* Name + index */}
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-bold text-white text-lg leading-tight">{partner.name}</h3>
          <span className="text-xs text-slate-500 bg-slate-900 px-2 py-1 rounded shrink-0">#{index + 1}</span>
        </div>

        {/* Address */}
        {partner.fullAddress && (
          <p className="text-slate-400 text-sm mt-2 flex items-start gap-1.5">
            <MapPin className="w-3.5 h-3.5 mt-0.5 shrink-0 text-rose-400" />
            {partner.fullAddress}
          </p>
        )}

        {/* Meta row */}
        <div className="flex flex-wrap gap-3 mt-3 text-sm">
          {distance && (
            <span className="text-slate-400 flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5" /> {distance} km
            </span>
          )}
          {hours && (
            <span className="text-slate-400 flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" /> {hours.opens} - {hours.closes}
            </span>
          )}
          {partner.rating && (
            <span className="text-yellow-400 flex items-center gap-1">
              <Star className="w-3.5 h-3.5 fill-current" /> {partner.rating}
            </span>
          )}
        </div>

        {/* Activities tags */}
        {activities.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-3">
            {activities.slice(0, 5).map((a, i) => (
              <span key={i} className="px-2 py-0.5 bg-rose-600/20 text-rose-300 rounded-full text-xs">
                {a}
              </span>
            ))}
            {activities.length > 5 && (
              <span className="px-2 py-0.5 bg-slate-700 text-slate-400 rounded-full text-xs">
                +{activities.length - 5}
              </span>
            )}
          </div>
        )}

        {/* Plan */}
        {partner.lowestPlan && (
          <p className="text-sm text-slate-400 mt-3">
            Plano min: <span className="text-emerald-400 font-medium">{partner.lowestPlan.name}</span>
            {partner.lowestPlan.price && (
              <span className="text-slate-500"> (R$ {partner.lowestPlan.price})</span>
            )}
          </p>
        )}

        {/* Link */}
        <a href={link} target="_blank" rel="noopener noreferrer"
          className="mt-3 flex items-center gap-1.5 text-sm text-rose-400 hover:text-rose-300 transition-colors">
          <ExternalLink className="w-3.5 h-3.5" /> Ver no Wellhub
        </a>
      </div>
    </div>
  );
}
