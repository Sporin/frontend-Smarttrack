// src/pages/dashboards/GestorDashboard.jsx
import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { deliveryService } from '../../services/deliveryService';
import { driverService } from '../../services/driverService';
import { notificationService } from '../../services/notificationService';
import { Link } from 'react-router-dom';

// Mapa de cores por status
const STATUS_STYLE = {
  EM_TRANSITO:  { label: 'Em Trânsito',  bg: 'bg-blue-500/10',   text: 'text-blue-400',   dot: 'bg-blue-400'   },
  PENDENTE:     { label: 'Pendente',     bg: 'bg-yellow-500/10', text: 'text-yellow-400', dot: 'bg-yellow-400' },
  ENTREGUE:     { label: 'Entregue',     bg: 'bg-green-500/10',  text: 'text-green-400',  dot: 'bg-green-400'  },
  INDISPONIVEL: { label: 'Indisponível', bg: 'bg-red-500/10',    text: 'text-red-400',    dot: 'bg-red-400'    },
  DISPONIVEL:   { label: 'Disponível',   bg: 'bg-green-500/10',  text: 'text-green-400',  dot: 'bg-green-400'  },
  EM_ROTA:      { label: 'Em Rota',      bg: 'bg-blue-500/10',   text: 'text-blue-400',   dot: 'bg-blue-400'   },
};

// Componente de badge de status reutilizável
function StatusBadge({ status }) {
  const s = STATUS_STYLE[status] || { label: status, bg: 'bg-gray-500/10', text: 'text-gray-400', dot: 'bg-gray-400' };
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${s.bg} ${s.text}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`}></span>
      {s.label}
    </span>
  );
}

// Componente de card de métrica
function MetricCard({ titulo, valor, icone, cor }) {
  const cores = {
    blue:   'bg-blue-500/10 text-blue-400',
    green:  'bg-green-500/10 text-green-400',
    yellow: 'bg-yellow-500/10 text-yellow-400',
    purple: 'bg-purple-500/10 text-purple-400',
  };
  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
      <div className="flex items-center justify-between mb-3">
        <p className="text-gray-400 text-sm">{titulo}</p>
        <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${cores[cor]}`}>
          {icone}
        </div>
      </div>
      <p className="text-3xl font-bold text-white">{valor}</p>
    </div>
  );
}

export default function GestorDashboard() {
  const { user, logout } = useAuth();

  const [entregas,      setEntregas]      = useState([]);
  const [motoristas,    setMotoristas]    = useState([]);
  const [notificacoes,  setNotificacoes]  = useState([]);
  const [carregando,    setCarregando]    = useState(true);
  const [abaAtiva,      setAbaAtiva]      = useState('entregas'); // 'entregas' | 'motoristas'

  // Busca os dados ao carregar a página
  useEffect(() => {
    async function carregarDados() {
      try {
        const [e, m, n] = await Promise.all([
          deliveryService.listarEntregas(),
          driverService.listarMotoristas(),
          notificationService.listarNotificacoes(),
        ]);
        setEntregas(e);
        setMotoristas(m);
        setNotificacoes(n);
      } catch (err) {
        console.error('Erro ao carregar dados:', err);
      } finally {
        setCarregando(false);
      }
    }
    carregarDados();
  }, []);

  // Métricas calculadas a partir dos dados
  const totalEntregas    = entregas.length;
  const emTransito       = entregas.filter(e => e.status === 'EM_TRANSITO').length;
  const entregues        = entregas.filter(e => e.status === 'ENTREGUE').length;
  const motoristasAtivos = motoristas.filter(m => m.status === 'EM_ROTA').length;
  const naoLidas         = notificacoes.filter(n => !n.lida).length;

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
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
              </svg>
            </div>
            <div>
              <p className="text-white font-semibold text-sm">Sistema de Logística</p>
              <p className="text-gray-400 text-xs">Gestor de Logística</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Sino de notificações */}
            <div className="relative">
              <button className="text-gray-400 hover:text-white transition">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002
                       6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6
                       8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6
                       0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
              </button>
              {naoLidas > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full
                                 text-white text-xs flex items-center justify-center font-bold">
                  {naoLidas}
                </span>
              )}
            </div>

            {/* Info do usuário + logout */}
            <div className="flex items-center gap-3">
              <div className="text-right">
                <p className="text-white text-sm font-medium">{user?.nome}</p>
                <p className="text-gray-400 text-xs">{user?.email}</p>
              </div>
              <button
                onClick={logout}
                className="text-gray-400 hover:text-red-400 transition"
                title="Sair"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3
                       3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 py-8">

        {/* Saudação */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-white">
            Olá, {user?.nome?.split(' ')[0]} 👋
          </h1>
          <p className="text-gray-400 mt-1">
            Aqui está o resumo das operações de hoje.
          </p>
        </div>

        {/* Botão Acompanhamento */}
        <div className="flex justify-end mb-6 -mt-4">
          <Link
            to="/gestor/acompanhamento"
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500
               text-white text-sm font-medium px-4 py-2.5 rounded-lg transition"
  >
            <span className="w-2 h-2 rounded-full bg-white animate-pulse"></span>
            Acompanhamento em Tempo Real
          </Link>
        </div>

        {/* Cards de métricas */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <MetricCard titulo="Total de Entregas" valor={totalEntregas} cor="blue"
            icone={
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10" />
              </svg>
            }
          />
          <MetricCard titulo="Em Trânsito" valor={emTransito} cor="yellow"
            icone={
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0
                     001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1
                     1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0
                     01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4
                     0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0" />
              </svg>
            }
          />
          <MetricCard titulo="Entregues" valor={entregues} cor="green"
            icone={
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            }
          />
          <MetricCard titulo="Motoristas em Rota" valor={motoristasAtivos} cor="purple"
            icone={
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7
                     7h14a7 7 0 00-7-7z" />
              </svg>
            }
          />
        </div>

        {/* Abas — Entregas e Motoristas */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">

          {/* Cabeçalho das abas */}
          <div className="flex border-b border-gray-800">
            <button
              onClick={() => setAbaAtiva('entregas')}
              className={`px-6 py-4 text-sm font-medium transition border-b-2 ${
                abaAtiva === 'entregas'
                  ? 'border-blue-500 text-blue-400'
                  : 'border-transparent text-gray-400 hover:text-white'
              }`}
            >
              Entregas ({totalEntregas})
            </button>
            <button
              onClick={() => setAbaAtiva('motoristas')}
              className={`px-6 py-4 text-sm font-medium transition border-b-2 ${
                abaAtiva === 'motoristas'
                  ? 'border-blue-500 text-blue-400'
                  : 'border-transparent text-gray-400 hover:text-white'
              }`}
            >
              Motoristas ({motoristas.length})
            </button>
          </div>

          {/* Conteúdo — Tabela de Entregas */}
          {abaAtiva === 'entregas' && (
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
                  {entregas.map((entrega) => (
                    <tr key={entrega.id} className="hover:bg-gray-800/50 transition">
                      <td className="px-6 py-4 text-gray-400 text-sm">#{entrega.id}</td>
                      <td className="px-6 py-4 text-white text-sm">{entrega.origem}</td>
                      <td className="px-6 py-4 text-white text-sm">{entrega.destino}</td>
                      <td className="px-6 py-4 text-gray-300 text-sm">{entrega.motorista}</td>
                      <td className="px-6 py-4 text-gray-300 text-sm">{entrega.data}</td>
                      <td className="px-6 py-4"><StatusBadge status={entrega.status} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Conteúdo — Tabela de Motoristas */}
          {abaAtiva === 'motoristas' && (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-800">
                    <th className="text-left text-xs font-medium text-gray-400 uppercase tracking-wider px-6 py-3">Nome</th>
                    <th className="text-left text-xs font-medium text-gray-400 uppercase tracking-wider px-6 py-3">CNH</th>
                    <th className="text-left text-xs font-medium text-gray-400 uppercase tracking-wider px-6 py-3">Veículo</th>
                    <th className="text-left text-xs font-medium text-gray-400 uppercase tracking-wider px-6 py-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800">
                  {motoristas.map((motorista) => (
                    <tr key={motorista.id} className="hover:bg-gray-800/50 transition">
                      <td className="px-6 py-4 text-white text-sm font-medium">{motorista.nome}</td>
                      <td className="px-6 py-4 text-gray-300 text-sm font-mono">{motorista.cnh}</td>
                      <td className="px-6 py-4 text-gray-300 text-sm">{motorista.veiculo}</td>
                      <td className="px-6 py-4"><StatusBadge status={motorista.status} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

        </div>

        {/* Notificações recentes */}
        <div className="mt-6 bg-gray-900 border border-gray-800 rounded-2xl p-6">
          <h2 className="text-white font-semibold mb-4">Notificações Recentes</h2>
          <div className="space-y-3">
            {notificacoes.map((n) => (
              <div key={n.id}
                className={`flex items-start gap-3 p-3 rounded-lg transition ${
                  n.lida ? 'opacity-50' : 'bg-gray-800/50'
                }`}
              >
                <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${
                  n.lida ? 'bg-gray-600' : 'bg-blue-400'
                }`}/>
                <div className="flex-1">
                  <p className="text-white text-sm">{n.mensagem}</p>
                  <p className="text-gray-500 text-xs mt-0.5">{n.data}</p>
                </div>
                {!n.lida && (
                  <span className="text-xs text-blue-400 font-medium">Nova</span>
                )}
              </div>
            ))}
          </div>
        </div>

      </main>
    </div>
  );
}