// src/pages/motorista/NovaEntrega.jsx
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { deliveryService } from '../../services/deliveryService';

export default function NovaEntrega() {
  const navigate    = useNavigate();
  const { user }    = useAuth();

  // Campos do formulário
  const [origem,   setOrigem]   = useState('');
  const [destino,  setDestino]  = useState('');
  const [dataEnvio, setDataEnvio] = useState('');

  // Controle
  const [erro,       setErro]       = useState('');
  const [sucesso,    setSucesso]    = useState(false);
  const [carregando, setCarregando] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setErro('');
    setSucesso(false);

    // Validações
    if (!origem || !destino) {
      setErro('Origem e destino são obrigatórios.');
      return;
    }
    if (origem.trim() === destino.trim()) {
      setErro('Origem e destino não podem ser iguais.');
      return;
    }

    try {
      setCarregando(true);

      await deliveryService.criarEntrega({
        origem,
        destino,
        data: dataEnvio || new Date().toISOString().split('T')[0],
        motorista: user?.nome,
        status: 'PENDENTE',
      });

      setSucesso(true);

      // Volta para o dashboard após 2 segundos
      setTimeout(() => navigate('/dashboard/motorista'), 2000);

    } catch (err) {
      setErro(err.response?.data?.message || 'Erro ao registrar entrega. Tente novamente.');
    } finally {
      setCarregando(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-950 flex flex-col">

      {/* Navbar */}
      <nav className="bg-gray-900 border-b border-gray-800 px-6 py-4">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Botão voltar */}
            <Link
              to="/dashboard/motorista"
              className="text-gray-400 hover:text-white transition"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M15 19l-7-7 7-7" />
              </svg>
            </Link>
            <div>
              <p className="text-white font-semibold text-sm">Nova Entrega</p>
              <p className="text-green-400 text-xs">Motorista</p>
            </div>
          </div>
          <p className="text-gray-400 text-sm">{user?.nome}</p>
        </div>
      </nav>

      {/* Conteúdo */}
      <main className="flex-1 flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-2xl">

          {/* Cabeçalho */}
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-white">Registrar Nova Entrega</h1>
            <p className="text-gray-400 mt-1">Preencha os dados da entrega que será realizada.</p>
          </div>

          {/* Card do formulário */}
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8">

            {/* Mensagem de sucesso */}
            {sucesso && (
              <div className="mb-6 bg-green-500/10 border border-green-500/30 rounded-lg px-4 py-3">
                <p className="text-green-400 text-sm">
                  ✅ Entrega registrada com sucesso! Voltando para o dashboard...
                </p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">

              {/* Origem e Destino lado a lado em telas grandes */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

                {/* Origem */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Origem <span className="text-red-400">*</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2">
                      <span className="w-2 h-2 rounded-full bg-blue-400 block"></span>
                    </span>
                    <input
                      type="text"
                      value={origem}
                      onChange={(e) => setOrigem(e.target.value)}
                      placeholder="Ex: São Paulo - SP"
                      disabled={carregando}
                      className="w-full bg-gray-800 border border-gray-700 text-white placeholder-gray-500
                                 rounded-lg pl-8 pr-4 py-3 focus:outline-none focus:border-blue-500
                                 focus:ring-1 focus:ring-blue-500 transition disabled:opacity-50"
                    />
                  </div>
                </div>

                {/* Destino */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Destino <span className="text-red-400">*</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2">
                      <span className="w-2 h-2 rounded-full bg-green-400 block"></span>
                    </span>
                    <input
                      type="text"
                      value={destino}
                      onChange={(e) => setDestino(e.target.value)}
                      placeholder="Ex: Campinas - SP"
                      disabled={carregando}
                      className="w-full bg-gray-800 border border-gray-700 text-white placeholder-gray-500
                                 rounded-lg pl-8 pr-4 py-3 focus:outline-none focus:border-blue-500
                                 focus:ring-1 focus:ring-blue-500 transition disabled:opacity-50"
                    />
                  </div>
                </div>
              </div>

              {/* Seta visual entre origem e destino */}
              <div className="hidden md:flex items-center justify-center -mt-2">
                <div className="flex items-center gap-2 text-gray-600 text-xs">
                  <div className="w-16 h-px bg-gray-700"></div>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                  <div className="w-16 h-px bg-gray-700"></div>
                </div>
              </div>

              {/* Data de envio */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Data de envio
                  <span className="text-gray-500 font-normal ml-1">(opcional — padrão: hoje)</span>
                </label>
                <input
                  type="date"
                  value={dataEnvio}
                  onChange={(e) => setDataEnvio(e.target.value)}
                  disabled={carregando}
                  className="w-full bg-gray-800 border border-gray-700 text-white
                             rounded-lg px-4 py-3 focus:outline-none focus:border-blue-500
                             focus:ring-1 focus:ring-blue-500 transition disabled:opacity-50
                             [color-scheme:dark]"
                />
              </div>

              {/* Informação do motorista */}
              <div className="bg-gray-800/50 border border-gray-700 rounded-lg px-4 py-3">
                <p className="text-gray-400 text-sm">
                  👤 Motorista responsável:{' '}
                  <span className="text-white font-medium">{user?.nome}</span>
                </p>
              </div>

              {/* Mensagem de erro */}
              {erro && (
                <div className="bg-red-500/10 border border-red-500/30 rounded-lg px-4 py-3">
                  <p className="text-red-400 text-sm">{erro}</p>
                </div>
              )}

              {/* Botões */}
              <div className="flex gap-3 pt-2">
                <Link
                  to="/dashboard/motorista"
                  className="flex-1 px-4 py-3 rounded-lg border border-gray-700
                             text-gray-300 hover:bg-gray-800 transition text-sm
                             font-medium text-center"
                >
                  Cancelar
                </Link>
                <button
                  type="submit"
                  disabled={carregando || sucesso}
                  className="flex-1 bg-green-600 hover:bg-green-500 disabled:bg-green-600/50
                             text-white font-semibold rounded-lg px-4 py-3 transition
                             disabled:cursor-not-allowed text-sm"
                >
                  {carregando ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10"
                          stroke="currentColor" strokeWidth="4"/>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                      </svg>
                      Registrando...
                    </span>
                  ) : 'Registrar Entrega'}
                </button>
              </div>

            </form>
          </div>
        </div>
      </main>
    </div>
  );
}