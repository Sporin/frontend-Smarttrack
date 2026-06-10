// src/pages/Register.jsx
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { driverService } from '../services/driverService';
import { operatorService } from '../services/operatorService';

export default function Register() {
  const navigate = useNavigate();

  // Campos comuns
  const [nome,       setNome]       = useState('');
  const [modalidade, setModalidade] = useState(''); // 'MOTORISTA' ou 'OPERADOR'

  // Campo exclusivo do motorista
  const [veiculo, setVeiculo] = useState('');

  // Controle
  const [erro,       setErro]       = useState('');
  const [sucesso,    setSucesso]    = useState(false);
  const [carregando, setCarregando] = useState(false);

  async function handleCadastro(e) {
    e.preventDefault();
    setErro('');
    setSucesso(false);

    // Validações
    if (!nome || !modalidade) {
      setErro('Preencha todos os campos obrigatórios.');
      return;
    }
    if (modalidade === 'MOTORISTA' && !veiculo) {
      setErro('Informe o veículo do motorista.');
      return;
    }

    try {
      setCarregando(true);

      if (modalidade === 'MOTORISTA') {
        await driverService.criarMotorista({ nome, veiculo });
      } else {
        await operatorService.criarOperador({ nome });
      }

      setSucesso(true);

      // Redireciona para o login após 2 segundos
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
          <p className="text-gray-400 mt-1">Registre-se aqui</p>
        </div>

        {/* Card do formulário */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8">

          {/* Mensagem de sucesso */}
          {sucesso && (
            <div className="mb-5 bg-green-500/10 border border-green-500/30 rounded-lg px-4 py-3">
              <p className="text-green-400 text-sm">
                ✅ Cadastro realizado com sucesso! Redirecionando para o login...
              </p>
            </div>
          )}

          <form onSubmit={handleCadastro} className="space-y-5">

            {/* Campo Modalidade — aparece primeiro para adaptar o formulário */}
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
                    onClick={() => {
                      setModalidade(op.valor);
                      setErro('');
                    }}
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

            {/* Campo Nome */}
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

            {/* Campo Veículo — só aparece para motorista */}
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

            {/* Mensagem de erro */}
            {erro && (
              <div className="bg-red-500/10 border border-red-500/30 rounded-lg px-4 py-3">
                <p className="text-red-400 text-sm">{erro}</p>
              </div>
            )}

            {/* Botão de cadastro */}
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

          {/* Link para login */}
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