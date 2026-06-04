// src/services/authService.js
import { createApi } from './api';

const USE_MOCK = process.env.REACT_APP_USE_MOCK === 'true';
const api = createApi(process.env.REACT_APP_OPERATOR_URL);

// Dados simulados para quando o backend não está pronto
const MOCK_USERS = [
  { id: 1, nome: 'Ana Gestora',    email: 'gestor@puc.com',   senha: '123456', role: 'GESTOR_LOGISTICA' },
  { id: 2, nome: 'Bruno Motorista', email: 'motorista@puc.com', senha: '123456', role: 'MOTORISTA' },
  { id: 3, nome: 'Carla Operadora', email: 'operador@puc.com',  senha: '123456', role: 'OPERADOR_ADMINISTRATIVO' },
];

export const authService = {
  // Faz login — retorna { token, user }
  async login(email, senha) {
    if (USE_MOCK) {
      // Simula uma espera de rede (500ms)
      await new Promise((r) => setTimeout(r, 500));
      const found = MOCK_USERS.find(
        (u) => u.email === email && u.senha === senha
      );
      if (!found) throw new Error('Email ou senha inválidos');
      const { senha: _, ...user } = found; // remove a senha do objeto
      return { token: 'mock-jwt-token-' + user.role, user };
    }
    // Quando USE_MOCK=false, chama o backend real
    const response = await api.post('/auth/login', { email, senha });
    return response.data;
  },

  // Cadastra novo usuário
  async cadastrar(dados) {
    if (USE_MOCK) {
      await new Promise((r) => setTimeout(r, 500));
      return { sucesso: true, mensagem: 'Usuário cadastrado com sucesso!' };
    }
    const response = await api.post('/auth/cadastrar', dados);
    return response.data;
  },

  // Desloga — limpa o localStorage
  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },
};