// src/pages/Login.jsx
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function Login() {
  const navigate  = useNavigate();
  const { login } = useAuth();

  // Campos do formulário
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');

  // Estados de controle
  const [erro,      setErro]      = useState('');    // mensagem de erro
  const [carregando, setCarregando] = useState(false); // botão desabilitado durante o login
  const [mostrarSenha, setMostrarSenha] = useState(false); // mostrar/ocultar senha

  async function handleLogin(e) {
    e.preventDefault(); // impede a página de recarregar
    setErro('');

    // Validação básica
    if (!email || !senha) {
      setErro('Preencha todos os campos.');
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

    try {
      setCarregando(true);
      const user = await login(email, senha); // chama o AuthContext

      // Redireciona para o dashboard correto conforme o papel do usuário
      const rotas = {
        GESTOR_LOGISTICA:        '/dashboard/gestor',
        MOTORISTA:               '/dashboard/motorista',
        OPERADOR_ADMINISTRATIVO: '/dashboard/operador',
      };
      navigate(rotas[user.role] || '/login');

    } catch (err) {
      setErro(err.message || 'Erro ao fazer login. Tente novamente.');
    } finally {
      setCarregando(false);
    }
  }

  // Preenche os campos automaticamente ao clicar nas credenciais de teste
  function preencherTeste(emailTeste, senhaTeste) {
    setEmail(emailTeste);
    setSenha(senhaTeste);
    setErro('');
  }

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Logo / Cabeçalho */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-2xl mb-4">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-white">SmartTrack</h1>
          <p className="text-gray-400 mt-1">Faça login para continuar</p>
        </div>
        {/* Card do formulário */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8">
          <form onSubmit={handleLogin} className="space-y-5">

            {/* Campo Email */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                E-mail
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

            {/* Campo Senha */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Senha
              </label>
              <div className="relative">
                <input
                  type={mostrarSenha ? 'text' : 'password'}
                  value={senha}
                  onChange={(e) => setSenha(e.target.value)}
                  placeholder="••••••••"
                  disabled={carregando}
                  className="w-full bg-gray-800 border border-gray-700 text-white placeholder-gray-500
                             rounded-lg px-4 py-3 pr-12 focus:outline-none focus:border-blue-500
                             focus:ring-1 focus:ring-blue-500 transition disabled:opacity-50"
                />
                {/* Botão mostrar/ocultar senha */}
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

            {/* Mensagem de erro */}
            {erro && (
              <div className="bg-red-500/10 border border-red-500/30 rounded-lg px-4 py-3">
                <p className="text-red-400 text-sm">{erro}</p>
              </div>
            )}

            {/* Botão de login */}
            <button
              type="submit"
              disabled={carregando}
              className="w-full bg-blue-600 hover:bg-blue-500 disabled:bg-blue-600/50
                         text-white font-semibold rounded-lg px-4 py-3 transition
                         disabled:cursor-not-allowed"
            >
              {carregando ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10"
                      stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor"
                      d="M4 12a8 8 0 018-8v8z"/>
                  </svg>
                  Entrando...
                </span>
              ) : 'Entrar'}
            </button>

          </form>

          {/* Link para cadastro */}
          <p className="text-center text-gray-400 text-sm mt-6">
            Não tem conta?{' '}
            <Link to="/cadastro" className="text-blue-400 hover:text-blue-300 transition font-medium">
              Cadastre-se
            </Link>
          </p>
        </div>

        {/* Credenciais de teste — visível só em desenvolvimento */}
        {process.env.REACT_APP_USE_MOCK === 'true' && (
          <div className="mt-6 bg-gray-900 border border-gray-700 rounded-2xl p-5">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
              🧪 Credenciais de teste
            </p>
            <div className="space-y-2">
              {[
                { label: 'Gestor',   email: 'gestor@puc.com',    senha: '123456', cor: 'blue'   },
                { label: 'Motorista', email: 'motorista@puc.com', senha: '123456', cor: 'green'  },
                { label: 'Operador', email: 'operador@puc.com',   senha: '123456', cor: 'purple' },
              ].map((u) => (
                <button
                  key={u.email}
                  onClick={() => preencherTeste(u.email, u.senha)}
                  className={`w-full text-left px-3 py-2 rounded-lg bg-gray-800
                    hover:bg-gray-700 transition text-sm`}
                >
                  <span className={`font-medium text-${u.cor}-400`}>{u.label}</span>
                  <span className="text-gray-400 ml-2">{u.email}</span>
                </button>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}