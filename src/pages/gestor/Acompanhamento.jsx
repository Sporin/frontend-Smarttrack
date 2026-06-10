// src/pages/gestor/Acompanhamento.jsx
import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { deliveryService } from '../../services/deliveryService';
import { driverService } from '../../services/driverService';

const STATUS_STYLE = {
  EM_TRANSITO:  { label: 'Em Trânsito',  bg: 'bg-blue-500/10',   text: 'text-blue-400',   dot: 'bg-blue-400',   borda: 'border-blue-500/20'   },
  PENDENTE:     { label: 'Pendente',     bg: 'bg-yellow-500/10', text: 'text-yellow-400', dot: 'bg-yellow-400', borda: 'border-yellow-500/20' },
  ENTREGUE:     { label: 'Entregue',     bg: 'bg-green-500/10',  text: 'text-green-400',  dot: 'bg-green-400',  borda: 'border-green-500/20'  },
  INDISPONIVEL: { label: 'Indisponível', bg: 'bg-red-500/10',    text: 'text-red-400',    dot: 'bg-red-400',    borda: 'border-red-500/20'    },
  DISPONIVEL:   { label: 'Disponível',   bg: 'bg-green-500/10',  text: 'text-green-400',  dot: 'bg-green-400',  borda: 'border-green-500/20'  },
  EM_ROTA:      { label: 'Em Rota',      bg: 'bg-blue-500/10',   text: 'text-blue-400',   dot: 'bg-blue-400',   borda: 'border-blue-500/20'   },
};

function StatusBadge({ status }) {
  const s = STATUS_STYLE[status] || { label: status, bg: 'bg-gray-500/10', text: 'text-gray-400', dot: 'bg-gray-400' };
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${s.bg} ${s.text}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`}></span>
      {s.label}
    </span>
  );
}

// Intervalo de atualização em milissegundos (30 segundos)
const INTERVALO_ATUALIZACAO = 30000;

export default function Acompanhamento() {
  const [entregas,   setEntregas]   = useState([]);
  const [motoristas, setMotoristas] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [atualizando, setAtualizando] = useState(false);
  const [ultimaAtualizacao, setUltimaAtualizacao] = useState(null);
  const [contador, setContador] = useState(INTERVALO_ATUALIZACAO / 1000);
  const [filtroStatus, setFiltroStatus] = useState('TODOS');

  // Função de busca — separada para poder ser chamada manualmente também
  const buscarDados = useCallback(async (silencioso = false) => {
    try {
      if (!silencioso) setCarregando(true);
      else setAtualizando(true);

      const [e, m] = await Promise.all([
        deliveryService.listarEntregas(),
        driverService.listarMotoristas(),
      ]);

      setEntregas(e);
      setMotoristas(m);
      setUltimaAtualizacao(new Date());
      setContador(INTERVALO_ATUALIZACAO / 1000);
    } catch (err) {
      console.error('Erro ao buscar dados:', err);
    } finally {
      setCarregando(false);
      setAtualizando(false);
    }
  }, []);

  // Busca inicial
  useEffect(() => {
    buscarDados(false);
  }, [buscarDados]);

  // Atualização automática a cada 30 segundos
  useEffect(() => {
    const intervalo = setInterval(() => {
      buscarDados(true);
    }, INTERVALO_ATUALIZACAO);

    return () => clearInterval(intervalo); // limpa ao sair da página
  }, [buscarDados]);

  // Contador regressivo visual
  useEffect(() => {
    const timer = setInterval(() => {
      setContador((prev) => (prev <= 1 ? INTERVALO_ATUALIZACAO / 1000 : prev - 1));
    }, 1000);

    return () => clearInterval(timer);
  }, [ultimaAtualizacao]);

  // Entregas filtradas por status
  const entregasFiltradas = filtroStatus === 'TODOS'
    ? entregas
    : entregas.filter((e) => e.status === filtroStatus);

  // Métricas
  const emTransito  = entregas.filter(e => e.status === 'EM_TRANSITO').length;
  const pendentes   = entregas.filter(e => e.status === 'PENDENTE').length;
  const entregues   = entregas.filter(e => e.status === 'ENTREGUE').length;
  const emRota      = motoristas.filter(m => m.status === 'EM_ROTA').length;

  if (carregando) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-center">
          <svg className="animate-spin w-8 h-8 text-blue-500 mx-auto mb-3" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
          </svg>
          <p className="text-gray-400">Carregando dados...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950">

      {/* Navbar */}
      <nav className="bg-gray-900 border-b border-gray-800 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              to="/dashboard/gestor"
              className="text-gray-400 hover:text-white transition"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M15 19l-7-7 7-7" />
              </svg>
            </Link>
            <div>
              <p className="text-white font-semibold text-sm">Acompanhamento em Tempo Real</p>
              <p className="text-blue-400 text-xs">Gestor de Logística</p>
            </div>
          </div>

          {/* Indicador de atualização */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 text-xs text-gray-400">
              {atualizando ? (
                <>
                  <svg className="animate-spin w-3 h-3 text-blue-400" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                  </svg>
                  <span className="text-blue-400">Atualizando...</span>
                </>
              ) : (
                <>
                  <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></span>
                  <span>Atualiza em {contador}s</span>
                </>
              )}
            </div>

            {/* Botão atualizar manualmente */}
            <button
              onClick={() => buscarDados(true)}
              disabled={atualizando}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gray-800
                         hover:bg-gray-700 text-gray-300 text-xs font-medium
                         border border-gray-700 transition disabled:opacity-50"
            >
              <svg className={`w-3.5 h-3.5 ${atualizando ? 'animate-spin' : ''}`}
                fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11
                     11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Atualizar
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 py-8">

        {/* Última atualização */}
        {ultimaAtualizacao && (
          <p className="text-gray-500 text-xs mb-6">
            Última atualização: {ultimaAtualizacao.toLocaleTimeString('pt-BR')}
          </p>
        )}

        {/* Cards de métricas em tempo real */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Em Trânsito',      valor: emTransito, cor: 'text-blue-400',   bg: 'bg-blue-500/10'   },
            { label: 'Pendentes',        valor: pendentes,  cor: 'text-yellow-400', bg: 'bg-yellow-500/10' },
            { label: 'Entregues',        valor: entregues,  cor: 'text-green-400',  bg: 'bg-green-500/10'  },
            { label: 'Motoristas em Rota', valor: emRota,   cor: 'text-purple-400', bg: 'bg-purple-500/10' },
          ].map((card) => (
            <div key={card.label}
              className="bg-gray-900 border border-gray-800 rounded-xl p-5">
              <div className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs mb-3 ${card.bg} ${card.cor}`}>
                <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse"></span>
                ao vivo
              </div>
              <p className={`text-3xl font-bold ${card.cor}`}>{card.valor}</p>
              <p className="text-gray-400 text-sm mt-1">{card.label}</p>
            </div>
          ))}
        </div>

        {/* Tabela de entregas com filtro */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden mb-6">
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-800">
            <h2 className="text-white font-semibold">
              Entregas
              <span className="text-gray-500 font-normal text-sm ml-2">
                ({entregasFiltradas.length} de {entregas.length})
              </span>
            </h2>
            <select
              value={filtroStatus}
              onChange={(e) => setFiltroStatus(e.target.value)}
              className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-1.5
                         text-sm text-white focus:outline-none focus:border-blue-500"
            >
              <option value="TODOS">Todos os status</option>
              <option value="EM_TRANSITO">Em Trânsito</option>
              <option value="PENDENTE">Pendente</option>
              <option value="ENTREGUE">Entregue</option>
            </select>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-800">
                  <th className="text-left text-xs font-medium text-gray-400 uppercase tracking-wider px-6 py-3">#</th>
                  <th className="text-left text-xs font-medium text-gray-400 uppercase tracking-wider px-6 py-3">Origem</th>
                  <th className="text-left text-xs font-medium text-gray-400 uppercase tracking-wider px-6 py-3">Destino</th>
                  <th className="text-left text-xs font-medium text-gray-400 uppercase tracking-wider px-6 py-3">Motorista</th>
                  <th className="text-left text-xs font-medium text-gray-400 uppercase tracking-wider px-6 py-3">Data</th>
                  <th className="text-left text-xs font-medium text-gray-400 uppercase tracking-wider px-6 py-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                {entregasFiltradas.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                      Nenhuma entrega encontrada.
                    </td>
                  </tr>
                ) : (
                  entregasFiltradas.map((entrega) => (
                    <tr key={entrega.id} className="hover:bg-gray-800/50 transition">
                      <td className="px-6 py-4 text-gray-400 text-sm">#{entrega.id}</td>
                      <td className="px-6 py-4 text-white text-sm">{entrega.origem}</td>
                      <td className="px-6 py-4 text-white text-sm">{entrega.destino}</td>
                      <td className="px-6 py-4 text-gray-300 text-sm">{entrega.motorista}</td>
                      <td className="px-6 py-4 text-gray-300 text-sm">{entrega.data}</td>
                      <td className="px-6 py-4"><StatusBadge status={entrega.status} /></td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Cards de motoristas */}
        <div>
          <h2 className="text-white font-semibold mb-4">
            Motoristas
            <span className="text-gray-500 font-normal text-sm ml-2">
              ({motoristas.length} cadastrados)
            </span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {motoristas.map((motorista) => {
              const s = STATUS_STYLE[motorista.status] || STATUS_STYLE['DISPONIVEL'];
              return (
                <div key={motorista.id}
                  className={`bg-gray-900 border rounded-xl p-4 ${s.borda}`}>
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-white font-medium">{motorista.nome}</p>
                    <StatusBadge status={motorista.status} />
                  </div>
                  <p className="text-gray-400 text-sm">🚚 {motorista.veiculo}</p>
                  <p className="text-gray-500 text-xs mt-1 font-mono">CNH: {motorista.cnh}</p>
                </div>
              );
            })}
          </div>
        </div>

      </main>
    </div>
  );
}