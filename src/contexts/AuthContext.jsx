// src/contexts/AuthContext.jsx
import { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/authService';

// 1. Cria o "recipiente" do contexto
const AuthContext = createContext(null);

// 2. Provider — envolve toda a aplicação e disponibiliza os dados
export function AuthProvider({ children }) {
  const [user, setUser]       = useState(null);  // dados do usuário logado
  const [token, setToken]     = useState(null);  // token JWT
  const [loading, setLoading] = useState(true);  // evita piscar a tela no carregamento

  // Roda uma vez quando a aplicação abre
  // Verifica se já existe um usuário salvo no navegador (localStorage)
  useEffect(() => {
    const savedToken = localStorage.getItem('token');
    const savedUser  = localStorage.getItem('user');

    if (savedToken && savedUser) {
      setToken(savedToken);
      setUser(JSON.parse(savedUser));
    }

    setLoading(false); // terminou de verificar
  }, []);

  // Função de login — chamada pela tela de Login
  async function login(email, senha) {
    try {
      const data = await authService.login(email, senha);

      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));

      setToken(data.token);
      setUser(data.user);

      return data.user;
    } catch (err) {
      // Trata erros do backend (400, 401, 500)
      const mensagem =
        err.response?.data?.message ||
        err.response?.data ||
        err.message ||
        'Erro ao fazer login. Tente novamente.';
      throw new Error(mensagem);
    }
  }

  // Função de logout — limpa tudo
  function logout() {
    authService.logout();
    setToken(null);
    setUser(null);
  }

  // Verifica se o usuário tem determinado papel (role)
  // Exemplo de uso: isRole('GESTOR_LOGISTICA')
  function isRole(role) {
    return user?.role === role;
  }

  // Tudo que ficará disponível para as outras telas
  const value = {
    user,
    token,
    loading,
    login,
    logout,
    isRole,
    isAuthenticated: !!token, // true se tiver token, false se não tiver
  };

  // Enquanto verifica o localStorage, não renderiza nada (evita piscar)
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <p className="text-gray-400">Carregando...</p>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

// 3. Hook customizado — facilita o uso nas telas
// Em vez de importar AuthContext + useContext em cada tela,
// você importa só o useAuth
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser usado dentro do AuthProvider');
  }
  return context;
}