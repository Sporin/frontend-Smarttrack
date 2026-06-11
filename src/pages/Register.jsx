// src/pages/Register.jsx
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { driverService } from '../services/driverService';
import { operatorService } from '../services/operatorService';

export default function Register() {
  const navigate = useNavigate();

  // Campos
  const [modalidade, setModalidade] = useState('');
  const [nome,       setNome]       = useState('');
  const [email,      setEmail]      = useState('');
  const [senha,      setSenha]      = useState('');
  const [veiculo,    setVeiculo]    = useState('');
  const [mostrarSenha, setMostrarSenha] = useState(false);

  // Controle
  const [erro,       setErro]       = useState('');
  const [sucesso,    setSucesso]    = useState(false);
  const [carregando, setCarregando] = useState(false);

  async function handleCadastro(e) {
    e.preventDefault();
    setErro('');
    setSucesso(false);

    // Validações
    if (!modalidade) {
      setErro('Selecione uma modalidade.');
      return;
    }
    if (!nome || !email || !senha) {
      setErro('Preencha todos os campos obrigatórios.');
      return;
    }
    if (!email.includes('@')) {
      setErro('Digite um e-mail válido.');
      return;
    }
    if (senha.length < 6) {
      setErro('A senha deve ter pelo menos 6 caracteres.');
      return;
    }
    if (modalidade === 'MOTORISTA' && !veiculo) {
      setErro('Informe o veículo do motorista.');
      return;
    }

    try {
      setCarregando(true);

      if (modalidade === 'MOTORISTA') {
        await driverService.criarMotorista({ nome, email, senha, veiculo });
      } else {
        await operatorService.criarOperador({ nome, email, senha, role: 'OPERADOR' });
      }

      setSucesso(true);
      setTimeout(() => navigate('/login'), 2000);

    } catch (err) {
      setErro(err.response?.data?.message || 'Erro ao cadastrar. Tente novamente.');
    } finally {
      setCarregando(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center px-4">
      <div className="w-full max-w-md">

        {/* Cabeçalho */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-2xl mb-4">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-white">Criar Conta</h1>
          <p className="text-gray-400 mt-1">Sistema de Logística — PUC-SP</p>
        </div>

        {/* Card */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8">

          {sucesso && (
            <div className="mb-5 bg-green-500/10 border border-green-500/30 rounded-lg px-4 py-3">
              <p className="text-green-400 text-sm">
                ✅ Cadastro realizado com sucesso! Redirecionando para o login...
              </p>
            </div>
          )}

          <form onSubmit={handleCadastro} className="space-y-5">

            {/* Modalidade */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Modalidade <span className="text-red-400">*</span>
              </label>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { valor: 'MOTORISTA', label: 'Motorista' },
                  { valor: 'OPERADOR',  label: 'Operador'  },
                ].map((op) => (
                  <button
                    key={op.valor}
                    type="button"
                    onClick={() => { setModalidade(op.valor); setErro(''); }}
                    className={`px-4 py-3 rounded-lg border text-sm font-medium transition ${
                      modalidade === op.valor
                        ? 'border-blue-500 bg-blue-500/10 text-blue-400'
                        : 'border-gray-700 bg-gray-800 text-gray-300 hover:border-gray-600'
                    }`}
                  >
                    {op.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Nome */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Nome completo <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                placeholder="Seu nome completo"
                disabled={carregando}
                className="w-full bg-gray-800 border border-gray-700 text-white placeholder-gray-500
                           rounded-lg px-4 py-3 focus:outline-none focus:border-blue-500
                           focus:ring-1 focus:ring-blue-500 transition disabled:opacity-50"
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                E-mail <span className="text-red-400">*</span>
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seu@email.com"
                disabled={carregando}
                className="w-full bg-gray-800 border border-gray-700 text-white placeholder-gray-500
                           rounded-lg px-4 py-3 focus:outline-none focus:border-blue-500
                           focus:ring-1 focus:ring-blue-500 transition disabled:opacity-50"
              />
            </div>

            {/* Senha */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Senha <span className="text-red-400">*</span>
              </label>
              <div className="relative">
                <input
                  type={mostrarSenha ? 'text' : 'password'}
                  value={senha}
                  onChange={(e) => setSenha(e.target.value)}
                  placeholder="Mínimo 6 caracteres"
                  disabled={carregando}
                  className="w-full bg-gray-800 border border-gray-700 text-white placeholder-gray-500
                             rounded-lg px-4 py-3 pr-12 focus:outline-none focus:border-blue-500
                             focus:ring-1 focus:ring-blue-500 transition disabled:opacity-50"
                />
                <button
                  type="button"
                  onClick={() => setMostrarSenha(!mostrarSenha)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-200 transition"
                >
                  {mostrarSenha ? (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7
                           a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878
                           l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59
                           3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025
                           10.025 0 01-4.132 4.411m0 0L21 21" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7
                           -1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {/* Veículo — só para motorista */}
            {modalidade === 'MOTORISTA' && (
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Veículo <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={veiculo}
                  onChange={(e) => setVeiculo(e.target.value)}
                  placeholder="Ex: Caminhão VW 24.280"
                  disabled={carregando}
                  className="w-full bg-gray-800 border border-gray-700 text-white placeholder-gray-500
                             rounded-lg px-4 py-3 focus:outline-none focus:border-blue-500
                             focus:ring-1 focus:ring-blue-500 transition disabled:opacity-50"
                />
              </div>
            )}

            {/* Erro */}
            {erro && (
              <div className="bg-red-500/10 border border-red-500/30 rounded-lg px-4 py-3">
                <p className="text-red-400 text-sm">{erro}</p>
              </div>
            )}

            {/* Botão */}
            <button
              type="submit"
              disabled={carregando || sucesso}
              className="w-full bg-blue-600 hover:bg-blue-500 disabled:bg-blue-600/50
                         text-white font-semibold rounded-lg px-4 py-3 transition
                         disabled:cursor-not-allowed"
            >
              {carregando ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10"
                      stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                  </svg>
                  Cadastrando...
                </span>
              ) : 'Criar conta'}
            </button>

          </form>

          {/* Link login */}
          <p className="text-center text-gray-400 text-sm mt-6">
            Já tem conta?{' '}
            <Link to="/login" className="text-blue-400 hover:text-blue-300 transition font-medium">
              Fazer login
            </Link>
          </p>
        </div>

      </div>
    </div>
  );
}