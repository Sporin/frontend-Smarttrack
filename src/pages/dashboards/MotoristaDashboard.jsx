// src/pages/dashboards/MotoristaDashboard.jsx
import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { deliveryService } from '../../services/deliveryService';
import { Link } from 'react-router-dom';

const STATUS_STYLE = {
  EM_TRANSITO: { label: 'Em Trânsito', bg: 'bg-blue-500/10',   text: 'text-blue-400',   dot: 'bg-blue-400'   },
  PENDENTE:    { label: 'Pendente',    bg: 'bg-yellow-500/10', text: 'text-yellow-400', dot: 'bg-yellow-400' },
  ENTREGUE:    { label: 'Entregue',    bg: 'bg-green-500/10',  text: 'text-green-400',  dot: 'bg-green-400'  },
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

// Modal de atualização de status
function ModalStatus({ entrega, onFechar, onAtualizar }) {
  const [novoStatus, setNovoStatus] = useState(entrega.status);
  const [carregando, setCarregando] = useState(false);

  async function handleAtualizar() {
    setCarregando(true);
    await onAtualizar(entrega.id, novoStatus);
    setCarregando(false);
    onFechar();
  }

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 px-4">
      <div className="bg-gray-900 border border-gray-700 rounded-2xl p-6 w-full max-w-sm">
        <h3 className="text-white font-semibold text-lg mb-1">Atualizar Status</h3>
        <p className="text-gray-400 text-sm mb-5">Entrega #{entrega.id} — {entrega.destino}</p>

        <div className="space-y-2 mb-6">
          {['PENDENTE', 'EM_TRANSITO', 'ENTREGUE'].map((s) => (
            <button
              key={s}
              onClick={() => setNovoStatus(s)}
              className={`w-full text-left px-4 py-3 rounded-lg border transition text-sm font-medium ${
                novoStatus === s
                  ? 'border-blue-500 bg-blue-500/10 text-blue-400'
                  : 'border-gray-700 bg-gray-800 text-gray-300 hover:border-gray-600'
              }`}
            >
              {s === 'PENDENTE'    && '⏳ Pendente'}
              {s === 'EM_TRANSITO' && '🚚 Em Trânsito'}
              {s === 'ENTREGUE'    && '✅ Entregue'}
            </button>
          ))}
        </div>

        <div className="flex gap-3">
          <button
            onClick={onFechar}
            className="flex-1 px-4 py-2.5 rounded-lg border border-gray-700
                       text-gray-300 hover:bg-gray-800 transition text-sm"
          >
            Cancelar
          </button>
          <button
            onClick={handleAtualizar}
            disabled={carregando || novoStatus === entrega.status}
            className="flex-1 px-4 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-500
                       disabled:opacity-50 disabled:cursor-not-allowed
                       text-white transition text-sm font-medium"
          >
            {carregando ? 'Salvando...' : 'Confirmar'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function MotoristaDashboard() {
  const { user, logout } = useAuth();

  const [entregas,         setEntregas]         = useState([]);
  const [carregando,       setCarregando]        = useState(true);
  const [entregaSelecionada, setEntregaSelecionada] = useState(null); // controla o modal

  useEffect(() => {
    async function carregarEntregas() {
      try {
        const dados = await deliveryService.listarEntregas();
        // Filtra só as entregas do motorista logado
        const minhasEntregas = dados.filter(
          (e) => e.motorista.toLowerCase() === user?.nome?.split(' ')[0].toLowerCase()
        );
        setEntregas(minhasEntregas.length > 0 ? minhasEntregas : dados);
      } catch (err) {
        console.error('Erro ao carregar entregas:', err);
      } finally {
        setCarregando(false);
      }
    }
    carregarEntregas();
  }, [user]);

  async function handleAtualizarStatus(id, novoStatus) {
    try {
      await deliveryService.atualizarStatus(id, novoStatus);
      // Atualiza localmente sem precisar recarregar tudo
      setEntregas((prev) =>
        prev.map((e) => (e.id === id ? { ...e, status: novoStatus } : e))
      );
    } catch (err) {
      console.error('Erro ao atualizar status:', err);
    }
  }

  // Métricas
  const pendentes   = entregas.filter(e => e.status === 'PENDENTE').length;
  const emTransito  = entregas.filter(e => e.status === 'EM_TRANSITO').length;
  const entregues   = entregas.filter(e => e.status === 'ENTREGUE').length;

  if (carregando) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-center">
          <svg className="animate-spin w-8 h-8 text-blue-500 mx-auto mb-3" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
          </svg>
          <p className="text-gray-400">Carregando entregas...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950">

      {/* Navbar */}
      <nav className="bg-gray-900 border-b border-gray-800 px-6 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0
                     01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1
                     0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104
                     0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0" />
              </svg>
            </div>
            <div>
              <p className="text-white font-semibold text-sm">Sistema de Logística</p>
              <p className="text-green-400 text-xs">Motorista</p>
            </div>
          </div>

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
                  d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3
                     3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-6 py-8">

        {/* Saudação */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-white">
            Olá, {user?.nome?.split(' ')[0]} 👋
          </h1>
          <p className="text-gray-400 mt-1">Aqui estão suas entregas de hoje.</p>
        </div>
        
        {/* Botão Nova Entrega */}
        <div className="flex justify-end mb-6 -mt-4">
          <Link
            to="/motorista/nova-entrega"
            className="flex items-center gap-2 bg-green-600 hover:bg-green-500
               text-white text-sm font-medium px-4 py-2.5 rounded-lg transition"
  >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M12 4v16m8-8H4" />
            </svg>
            Nova Entrega
          </Link>
        </div>

        {/* Cards de métricas */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 text-center">
            <p className="text-3xl font-bold text-yellow-400">{pendentes}</p>
            <p className="text-gray-400 text-sm mt-1">Pendentes</p>
          </div>
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 text-center">
            <p className="text-3xl font-bold text-blue-400">{emTransito}</p>
            <p className="text-gray-400 text-sm mt-1">Em Trânsito</p>
          </div>
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 text-center">
            <p className="text-3xl font-bold text-green-400">{entregues}</p>
            <p className="text-gray-400 text-sm mt-1">Entregues</p>
          </div>
        </div>

        {/* Lista de entregas */}
        <div className="space-y-3">
          <h2 className="text-white font-semibold">Minhas Entregas</h2>

          {entregas.length === 0 ? (
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-8 text-center">
              <p className="text-gray-400">Nenhuma entrega atribuída no momento.</p>
            </div>
          ) : (
            entregas.map((entrega) => (
              <div
                key={entrega.id}
                className="bg-gray-900 border border-gray-800 rounded-xl p-5
                           hover:border-gray-700 transition"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-gray-500 text-xs font-mono">#{entrega.id}</span>
                      <StatusBadge status={entrega.status} />
                    </div>

                    {/* Rota com seta */}
                    <div className="flex items-center gap-2 text-sm">
                      <div className="flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-blue-400 flex-shrink-0"></span>
                        <span className="text-white font-medium">{entrega.origem}</span>
                      </div>
                      <svg className="w-4 h-4 text-gray-500 flex-shrink-0" fill="none"
                        stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                          d="M17 8l4 4m0 0l-4 4m4-4H3" />
                      </svg>
                      <div className="flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-green-400 flex-shrink-0"></span>
                        <span className="text-white font-medium">{entrega.destino}</span>
                      </div>
                    </div>

                    <p className="text-gray-500 text-xs mt-2">📅 {entrega.data}</p>
                  </div>

                  {/* Botão de atualizar status */}
                  {entrega.status !== 'ENTREGUE' && (
                    <button
                      onClick={() => setEntregaSelecionada(entrega)}
                      className="flex-shrink-0 px-3 py-1.5 rounded-lg bg-gray-800
                                 hover:bg-gray-700 text-gray-300 text-xs font-medium
                                 border border-gray-700 transition"
                    >
                      Atualizar
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </main>

      {/* Modal de atualização de status */}
      {entregaSelecionada && (
        <ModalStatus
          entrega={entregaSelecionada}
          onFechar={() => setEntregaSelecionada(null)}
          onAtualizar={handleAtualizarStatus}
        />
      )}

    </div>
  );
}