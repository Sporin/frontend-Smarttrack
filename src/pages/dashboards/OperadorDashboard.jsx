// src/pages/dashboards/OperadorDashboard.jsx

import { useState, useEffect } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { deliveryService } from "../../services/deliveryService";
import { driverService } from "../../services/driverService";
import { notificationService } from "../../services/notificationService";

// ─────────────────────────────────────────
// Helpers visuais
// ─────────────────────────────────────────

function badgeStatus(status) {
  const map = {
    PENDENTE:    "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30",
    EM_TRANSITO: "bg-blue-500/20 text-blue-400 border border-blue-500/30",
    ENTREGUE:    "bg-green-500/20 text-green-400 border border-green-500/30",
    CANCELADO:   "bg-red-500/20 text-red-400 border border-red-500/30",
  };
  return map[status] || "bg-gray-500/20 text-gray-400 border border-gray-500/30";
}

function badgeMotorista(status) {
  const map = {
    DISPONIVEL:   "bg-green-500/20 text-green-400 border border-green-500/30",
    EM_ROTA:      "bg-blue-500/20 text-blue-400 border border-blue-500/30",
    INDISPONIVEL: "bg-red-500/20 text-red-400 border border-red-500/30",
  };
  return map[status] || "bg-gray-500/20 text-gray-400 border border-gray-500/30";
}

// ─────────────────────────────────────────
// Componente principal
// ─────────────────────────────────────────

export default function OperadorDashboard() {
  const { user, logout } = useAuth();

  // ── Estados de dados ──
  const [entregas, setEntregas]         = useState([]);
  const [motoristas, setMotoristas]     = useState([]);
  const [notificacoes, setNotificacoes] = useState([]);
  const [carregando, setCarregando]     = useState(true);

  // ── Estados do formulário ──
  const [novaEntrega, setNovaEntrega] = useState({
    origem: "",
    destino: "",
    motorista: "",
  });
  const [enviando, setEnviando] = useState(false);
  const [sucesso, setSucesso]   = useState(false);
  const [erroForm, setErroForm] = useState("");

  // ── Filtro da tabela ──
  const [filtroStatus, setFiltroStatus] = useState("TODOS");

  // ─────────────────────────────────────────
  // Carregamento inicial
  // ─────────────────────────────────────────
  useEffect(() => {
    async function carregarDados() {
      try {
        const [resEntregas, resMotoristas, resNotif] = await Promise.all([
          deliveryService.listarEntregas(),
          driverService.listarMotoristas(),
          notificationService.listarNotificacoes(),
        ]);
        setEntregas(resEntregas);
        setMotoristas(resMotoristas);
        // Mostra só as não lidas nas notificações
        setNotificacoes(resNotif.filter((n) => !n.lida));
      } catch (err) {
        console.error("Erro ao carregar dados:", err);
      } finally {
        setCarregando(false);
      }
    }
    carregarDados();
  }, []);

  // ─────────────────────────────────────────
  // Ações
  // ─────────────────────────────────────────

  function handleCampo(e) {
    setNovaEntrega({ ...novaEntrega, [e.target.name]: e.target.value });
  }

  async function handleCriarEntrega(e) {
    e.preventDefault();
    setErroForm("");
    setSucesso(false);

    if (!novaEntrega.origem || !novaEntrega.destino || !novaEntrega.motorista) {
      setErroForm("Preencha todos os campos obrigatórios.");
      return;
    }

    try {
      setEnviando(true);
      const criada = await deliveryService.criarEntrega(novaEntrega);
      setEntregas((prev) => [criada, ...prev]);
      setNovaEntrega({ origem: "", destino: "", motorista: "" });
      setSucesso(true);
      setTimeout(() => setSucesso(false), 3000);
    } catch (err) {
      setErroForm("Erro ao cadastrar entrega. Tente novamente.");
    } finally {
      setEnviando(false);
    }
  }

  async function handleMarcarLida(id) {
    try {
      await notificationService.marcarComoLida(id);
      setNotificacoes((prev) => prev.filter((n) => n.id !== id));
    } catch (err) {
      console.error("Erro ao marcar notificação:", err);
    }
  }

  // ─────────────────────────────────────────
  // Dados derivados
  // ─────────────────────────────────────────
  const entregasFiltradas =
    filtroStatus === "TODOS"
      ? entregas
      : entregas.filter((e) => e.status === filtroStatus);

  const totalEntregas    = entregas.length;
  const entregues        = entregas.filter((e) => e.status === "ENTREGUE").length;
  const emTransito       = entregas.filter((e) => e.status === "EM_TRANSITO").length;
  const motoristasLivres = motoristas.filter((m) => m.status === "DISPONIVEL").length;

  // ─────────────────────────────────────────
  // Tela de carregamento
  // ─────────────────────────────────────────
  if (carregando) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <p className="text-gray-400 animate-pulse text-lg">Carregando painel...</p>
      </div>
    );
  }

  // ─────────────────────────────────────────
  // Render
  // ─────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gray-950 text-gray-100">

      {/* ── HEADER ── */}
      <header className="bg-gray-900 border-b border-gray-800 px-6 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white">Painel do Operador</h1>
          <p className="text-sm text-gray-400">Bem-vindo, {user?.nome || "Operador"}</p>
        </div>
        <button
          onClick={logout}
          className="text-sm text-gray-400 hover:text-red-400 transition-colors"
        >
          Sair
        </button>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8 space-y-10">

        {/* ══════════════════════════════════════
            SEÇÃO 1 — MÉTRICAS
        ══════════════════════════════════════ */}
        <section>
          <h2 className="text-lg font-semibold text-gray-200 mb-4">Visão Geral</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: "Total de Entregas",  valor: totalEntregas,    cor: "text-white" },
              { label: "Entregues",          valor: entregues,        cor: "text-green-400" },
              { label: "Em Trânsito",        valor: emTransito,       cor: "text-blue-400" },
              { label: "Motoristas Livres",  valor: motoristasLivres, cor: "text-yellow-400" },
            ].map((card) => (
              <div key={card.label} className="bg-gray-900 border border-gray-800 rounded-xl p-5">
                <p className="text-sm text-gray-400">{card.label}</p>
                <p className={`text-3xl font-bold mt-1 ${card.cor}`}>{card.valor}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ══════════════════════════════════════
            SEÇÃO 2 — CADASTRAR ENTREGA
        ══════════════════════════════════════ */}
        <section>
          <h2 className="text-lg font-semibold text-gray-200 mb-4">Cadastrar Nova Entrega</h2>
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">

            {sucesso && (
              <div className="mb-4 p-3 rounded-lg bg-green-500/20 border border-green-500/30 text-green-400 text-sm">
                ✅ Entrega cadastrada com sucesso!
              </div>
            )}
            {erroForm && (
              <div className="mb-4 p-3 rounded-lg bg-red-500/20 border border-red-500/30 text-red-400 text-sm">
                ⚠️ {erroForm}
              </div>
            )}

            <form onSubmit={handleCriarEntrega} className="grid grid-cols-1 md:grid-cols-3 gap-4">

              {/* Origem */}
              <div className="flex flex-col gap-1">
                <label className="text-sm text-gray-400">
                  Origem <span className="text-red-400">*</span>
                </label>
                <input
                  name="origem"
                  value={novaEntrega.origem}
                  onChange={handleCampo}
                  placeholder="Ex: São Paulo - SP"
                  className="bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
                />
              </div>

              {/* Destino */}
              <div className="flex flex-col gap-1">
                <label className="text-sm text-gray-400">
                  Destino <span className="text-red-400">*</span>
                </label>
                <input
                  name="destino"
                  value={novaEntrega.destino}
                  onChange={handleCampo}
                  placeholder="Ex: Campinas - SP"
                  className="bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
                />
              </div>

              {/* Motorista (só os disponíveis) */}
              <div className="flex flex-col gap-1">
                <label className="text-sm text-gray-400">
                  Motorista <span className="text-red-400">*</span>
                </label>
                <select
                  name="motorista"
                  value={novaEntrega.motorista}
                  onChange={handleCampo}
                  className="bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
                >
                  <option value="">Selecione um motorista</option>
                  {motoristas
                    .filter((m) => m.status === "DISPONIVEL")
                    .map((m) => (
                      <option key={m.id} value={m.nome}>
                        {m.nome} — {m.veiculo}
                      </option>
                    ))}
                </select>
              </div>

              {/* Botão ocupa as 3 colunas */}
              <div className="md:col-span-3">
                <button
                  type="submit"
                  disabled={enviando}
                  className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-semibold py-2 px-4 rounded-lg transition-colors text-sm"
                >
                  {enviando ? "Cadastrando..." : "Cadastrar Entrega"}
                </button>
              </div>

            </form>
          </div>
        </section>

        {/* ══════════════════════════════════════
            SEÇÃO 3 — RELATÓRIO DE ENTREGAS
        ══════════════════════════════════════ */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-200">Relatório de Entregas</h2>
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

          <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-800 text-gray-400 text-left">
                  <th className="px-4 py-3 font-medium">ID</th>
                  <th className="px-4 py-3 font-medium">Origem</th>
                  <th className="px-4 py-3 font-medium hidden md:table-cell">Destino</th>
                  <th className="px-4 py-3 font-medium hidden md:table-cell">Motorista</th>
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
                    <tr
                      key={entrega.id}
                      className="border-b border-gray-800/50 hover:bg-gray-800/30 transition-colors"
                    >
                      <td className="px-4 py-3 text-gray-400">#{entrega.id}</td>
                      <td className="px-4 py-3 text-white font-medium">{entrega.origem}</td>
                      <td className="px-4 py-3 text-gray-400 hidden md:table-cell">{entrega.destino}</td>
                      <td className="px-4 py-3 text-gray-400 hidden md:table-cell">{entrega.motorista}</td>
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

        {/* ══════════════════════════════════════
            SEÇÃO 4 — MOTORISTAS
        ══════════════════════════════════════ */}
        <section>
          <h2 className="text-lg font-semibold text-gray-200 mb-4">Motoristas</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {motoristas.length === 0 ? (
              <p className="text-gray-500 col-span-3">Nenhum motorista encontrado.</p>
            ) : (
              motoristas.map((m) => (
                <div
                  key={m.id}
                  className="bg-gray-900 border border-gray-800 rounded-xl p-4 flex flex-col gap-2"
                >
                  <div className="flex items-center justify-between">
                    <p className="font-semibold text-white">{m.nome}</p>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${badgeMotorista(m.status)}`}>
                      {m.status === "DISPONIVEL"   ? "Disponível"   :
                       m.status === "EM_ROTA"      ? "Em Rota"      : "Indisponível"}
                    </span>
                  </div>
                  <p className="text-sm text-gray-400">🚚 {m.veiculo}</p>
                  <p className="text-sm text-gray-400">🪪 CNH: {m.cnh}</p>
                </div>
              ))
            )}
          </div>
        </section>

        {/* ══════════════════════════════════════
            SEÇÃO 5 — NOTIFICAÇÕES
        ══════════════════════════════════════ */}
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
                <div
                  key={n.id}
                  className="bg-gray-900 border border-gray-800 rounded-xl px-5 py-4 flex items-start justify-between gap-4"
                >
                  <div>
                    <p className="text-sm text-white">{n.mensagem}</p>
                    <p className="text-xs text-gray-500 mt-1">{n.data}</p>
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