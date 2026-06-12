// src/pages/dashboards/OperadorDashboard.jsx
import { useState, useEffect, useCallback } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { deliveryService } from "../../services/deliveryService";
import { driverService } from "../../services/driverService";
import { notificationService } from "../../services/notificationService";

function badgeStatus(status) {
  const map = {
    PENDENTE:    "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30",
    EM_TRANSITO: "bg-blue-500/20 text-blue-400 border border-blue-500/30",
    ENTREGUE:    "bg-green-500/20 text-green-400 border border-green-500/30",
    CANCELADO:   "bg-red-500/20 text-red-400 border border-red-500/30",
  };
  return map[status] || "bg-gray-500/20 text-gray-400 border border-gray-500/30";
}

export default function OperadorDashboard() {
  const { user, logout } = useAuth();

  const [entregas,      setEntregas]      = useState([]);
  const [motoristas,    setMotoristas]    = useState([]);
  const [notificacoes,  setNotificacoes]  = useState([]);
  const [carregando,    setCarregando]    = useState(true);
  const [ultimaAtualizacao, setUltimaAtualizacao] = useState(null);

  const [motoristaId, setMotoristaId] = useState('');
  const [dataEnvio,   setDataEnvio]   = useState('');
  const [enviando,    setEnviando]    = useState(false);
  const [sucesso,     setSucesso]     = useState(false);
  const [erroForm,    setErroForm]    = useState('');

  const [filtroStatus, setFiltroStatus] = useState('TODOS');

  // ── Carrega entregas (reutilizado no polling) ──
  const carregarEntregas = useCallback(async () => {
    try {
      const res = await deliveryService.listarEntregas();
      setEntregas(res);
      setUltimaAtualizacao(new Date().toLocaleTimeString('pt-BR'));
    } catch (err) {
      console.error('Erro ao atualizar entregas:', err);
    }
  }, []);

  // ── Carregamento inicial ──
  useEffect(() => {
    async function carregarDados() {
      try {
        const [resEntregas, resMotoristas] = await Promise.all([
          deliveryService.listarEntregas(),
          driverService.listarMotoristas(),
        ]);
        setEntregas(resEntregas);
        setMotoristas(resMotoristas);
        setUltimaAtualizacao(new Date().toLocaleTimeString('pt-BR'));
      } catch (err) {
        console.error('Erro ao carregar dados:', err);
      }

      try {
        const resNotif = await notificationService.listarNotificacoes();
        setNotificacoes(resNotif.filter((n) => !n.lida));
      } catch (err) {
        console.error('Erro ao carregar notificações:', err);
      } finally {
        setCarregando(false);
      }
    }
    carregarDados();
  }, []);

  // ── Polling: atualiza entregas a cada 30s ──
  useEffect(() => {
    const intervalo = setInterval(carregarEntregas, 30000);
    return () => clearInterval(intervalo); // limpa ao sair da tela
  }, [carregarEntregas]);

  async function handleCriarEntrega(e) {
    e.preventDefault();
    setErroForm('');
    setSucesso(false);

    if (!motoristaId) {
      setErroForm('Selecione um motorista.');
      return;
    }

    try {
      setEnviando(true);
      const criada = await deliveryService.criarEntrega({
        motoristaId: Number(motoristaId),
        operadorId:  user?.id,
        dataEnvio:   dataEnvio || new Date().toISOString().split('T')[0],
      });
      setEntregas((prev) => [criada, ...prev]);
      setMotoristaId('');
      setDataEnvio('');
      setSucesso(true);
      setTimeout(() => setSucesso(false), 3000);
    } catch (err) {
      setErroForm('Erro ao cadastrar entrega. Tente novamente.');
    } finally {
      setEnviando(false);
    }
  }

  async function handleMarcarLida(id) {
    try {
      await notificationService.marcarComoLida(id);
      setNotificacoes((prev) => prev.filter((n) => n.id !== id));
    } catch (err) {
      console.error('Erro ao marcar notificação:', err);
    }
  }

  const entregasFiltradas =
    filtroStatus === 'TODOS'
      ? entregas
      : entregas.filter((e) => e.status === filtroStatus);

  const totalEntregas = entregas.length;
  const entregues     = entregas.filter((e) => e.status === 'ENTREGUE').length;
  const emTransito    = entregas.filter((e) => e.status === 'EM_TRANSITO').length;
  const pendentes     = entregas.filter((e) => e.status === 'PENDENTE').length;
  const cancelados    = entregas.filter((e) => e.status === 'CANCELADO').length;

  if (carregando) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <p className="text-gray-400 animate-pulse text-lg">Carregando painel...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100">

      {/* HEADER */}
      <header className="bg-gray-900 border-b border-gray-800 px-6 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white">Painel do Operador</h1>
          <p className="text-sm text-gray-400">Bem-vindo, {user?.nome || 'Operador'}</p>
        </div>
        <button onClick={logout} className="text-sm text-gray-400 hover:text-red-400 transition-colors">
          Sair
        </button>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8 space-y-10">

        {/* ══ SEÇÃO 1 — MÉTRICAS ══ */}
        <section>
          <h2 className="text-lg font-semibold text-gray-200 mb-4">Visão Geral</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'Total de Entregas', valor: totalEntregas, cor: 'text-white'      },
              { label: 'Entregues',         valor: entregues,     cor: 'text-green-400'  },
              { label: 'Em Trânsito',       valor: emTransito,    cor: 'text-blue-400'   },
              { label: 'Pendentes',         valor: pendentes,     cor: 'text-yellow-400' },
            ].map((card) => (
              <div key={card.label} className="bg-gray-900 border border-gray-800 rounded-xl p-5">
                <p className="text-sm text-gray-400">{card.label}</p>
                <p className={`text-3xl font-bold mt-1 ${card.cor}`}>{card.valor}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ══ SEÇÃO 2 — PUBLICAR ENTREGA ══ */}
        <section>
          <h2 className="text-lg font-semibold text-gray-200 mb-4">Publicar Nova Entrega</h2>
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
            {sucesso && (
              <div className="mb-4 p-3 rounded-lg bg-green-500/20 border border-green-500/30 text-green-400 text-sm">
                ✅ Entrega publicada com sucesso!
              </div>
            )}
            {erroForm && (
              <div className="mb-4 p-3 rounded-lg bg-red-500/20 border border-red-500/30 text-red-400 text-sm">
                ⚠️ {erroForm}
              </div>
            )}
            <form onSubmit={handleCriarEntrega} className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
              <div className="flex flex-col gap-1">
                <label className="text-sm text-gray-400">
                  Motorista <span className="text-red-400">*</span>
                </label>
                <select
                  value={motoristaId}
                  onChange={(e) => setMotoristaId(e.target.value)}
                  disabled={enviando}
                  className="bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
                >
                  <option value="">Selecione um motorista</option>
                  {motoristas.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.nome} — {m.veiculo}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-sm text-gray-400">
                  Data de envio
                  <span className="text-gray-500 font-normal ml-1">(opcional)</span>
                </label>
                <input
                  type="date"
                  value={dataEnvio}
                  onChange={(e) => setDataEnvio(e.target.value)}
                  disabled={enviando}
                  className="bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-sm text-white
                             focus:outline-none focus:border-blue-500 [color-scheme:dark]"
                />
              </div>

              <button
                type="submit"
                disabled={enviando}
                className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-semibold
                           py-2 px-6 rounded-lg transition-colors text-sm"
              >
                {enviando ? 'Publicando...' : 'Publicar Entrega'}
              </button>
            </form>
          </div>
        </section>

        {/* ══ SEÇÃO 3 — MONITORAR ENTREGAS ══ */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-semibold text-gray-200">Monitorar Entregas</h2>
              {ultimaAtualizacao && (
                <p className="text-xs text-gray-500 mt-0.5">
                  🔄 Atualizado às {ultimaAtualizacao} — próxima em 30s
                </p>
              )}
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={carregarEntregas}
                className="text-xs text-blue-400 hover:text-blue-300 transition"
              >
                Atualizar agora
              </button>
              <select
                value={filtroStatus}
                onChange={(e) => setFiltroStatus(e.target.value)}
                className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none focus:border-blue-500"
              >
                <option value="TODOS">Todos</option>
                <option value="PENDENTE">Pendente</option>
                <option value="EM_TRANSITO">Em Trânsito</option>
                <option value="ENTREGUE">Entregue</option>
                <option value="CANCELADO">Cancelado</option>
              </select>
            </div>
          </div>

          <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-800 text-gray-400 text-left">
                  <th className="px-4 py-3 font-medium">ID</th>
                  <th className="px-4 py-3 font-medium">Data Envio</th>
                  <th className="px-4 py-3 font-medium hidden md:table-cell">Data Entrega</th>
                  <th className="px-4 py-3 font-medium hidden md:table-cell">Motorista ID</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {entregasFiltradas.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-8 text-center text-gray-500">
                      Nenhuma entrega encontrada.
                    </td>
                  </tr>
                ) : (
                  entregasFiltradas.map((entrega) => (
                    <tr key={entrega.id} className="border-b border-gray-800/50 hover:bg-gray-800/30 transition-colors">
                      <td className="px-4 py-3 text-gray-400">#{entrega.id}</td>
                      <td className="px-4 py-3 text-white">{entrega.dataEnvio || '—'}</td>
                      <td className="px-4 py-3 text-gray-400 hidden md:table-cell">{entrega.dataEntrega || '—'}</td>
                      <td className="px-4 py-3 text-gray-400 hidden md:table-cell">
                        {entrega.motoristaId ? `#${entrega.motoristaId}` : 'Sem motorista'}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${badgeStatus(entrega.status)}`}>
                          {entrega.status}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>

        {/* ══ SEÇÃO 4 — RELATÓRIO ══ */}
        <section>
          <h2 className="text-lg font-semibold text-gray-200 mb-4">Relatório</h2>

          {/* Cards com totais */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            {[
              { label: 'Pendentes',   valor: pendentes,     cor: 'text-yellow-400', bg: 'border-yellow-500/20' },
              { label: 'Em Trânsito', valor: emTransito,    cor: 'text-blue-400',   bg: 'border-blue-500/20'   },
              { label: 'Entregues',   valor: entregues,     cor: 'text-green-400',  bg: 'border-green-500/20'  },
              { label: 'Cancelados',  valor: cancelados,    cor: 'text-red-400',    bg: 'border-red-500/20'    },
            ].map((card) => (
              <div key={card.label} className={`bg-gray-900 border ${card.bg} rounded-xl p-5`}>
                <p className="text-sm text-gray-400">{card.label}</p>
                <p className={`text-3xl font-bold mt-1 ${card.cor}`}>{card.valor}</p>
                <p className="text-xs text-gray-500 mt-1">
                  {totalEntregas > 0 ? Math.round((card.valor / totalEntregas) * 100) : 0}% do total
                </p>
              </div>
            ))}
          </div>

          {/* Lista detalhada */}
          <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-800">
              <p className="text-sm text-gray-400">Lista detalhada de todas as entregas</p>
            </div>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-800 text-gray-400 text-left">
                  <th className="px-4 py-3 font-medium">ID</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium hidden md:table-cell">Data Envio</th>
                  <th className="px-4 py-3 font-medium hidden md:table-cell">Data Entrega</th>
                  <th className="px-4 py-3 font-medium hidden md:table-cell">Motorista ID</th>
                  <th className="px-4 py-3 font-medium hidden md:table-cell">Operador ID</th>
                </tr>
              </thead>
              <tbody>
                {entregas.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
                      Nenhuma entrega cadastrada.
                    </td>
                  </tr>
                ) : (
                  entregas.map((entrega) => (
                    <tr key={entrega.id} className="border-b border-gray-800/50 hover:bg-gray-800/30 transition-colors">
                      <td className="px-4 py-3 text-gray-400">#{entrega.id}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${badgeStatus(entrega.status)}`}>
                          {entrega.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-400 hidden md:table-cell">{entrega.dataEnvio || '—'}</td>
                      <td className="px-4 py-3 text-gray-400 hidden md:table-cell">{entrega.dataEntrega || '—'}</td>
                      <td className="px-4 py-3 text-gray-400 hidden md:table-cell">
                        {entrega.motoristaId ? `#${entrega.motoristaId}` : '—'}
                      </td>
                      <td className="px-4 py-3 text-gray-400 hidden md:table-cell">
                        {entrega.operadorId ? `#${entrega.operadorId}` : '—'}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>

        {/* ══ SEÇÃO 5 — NOTIFICAÇÕES ══ */}
        <section>
          <h2 className="text-lg font-semibold text-gray-200 mb-4">
            Notificações
            {notificacoes.length > 0 && (
              <span className="ml-2 bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                {notificacoes.length}
              </span>
            )}
          </h2>
          {notificacoes.length === 0 ? (
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 text-center text-gray-500">
              Nenhuma notificação pendente. ✅
            </div>
          ) : (
            <div className="space-y-3">
              {notificacoes.map((n) => (
                <div key={n.id} className="bg-gray-900 border border-gray-800 rounded-xl px-5 py-4 flex items-start justify-between gap-4">
                  <div>
                    <p className="text-sm text-white">{n.mensagem}</p>
                    <p className="text-xs text-gray-500 mt-1">{n.dataEnvio}</p>
                  </div>
                  <button
                    onClick={() => handleMarcarLida(n.id)}
                    className="text-xs text-blue-400 hover:text-blue-300 whitespace-nowrap transition-colors"
                  >
                    Marcar lida
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>

      </main>
    </div>
  );
}