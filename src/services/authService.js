// src/services/authService.js
import { createApi } from './api';

const USE_MOCK = process.env.REACT_APP_USE_MOCK === 'true';

// ✅ Corrigido: removido '/driver-service' da URL
const api = createApi('http://localhost:8082');

const MOCK_USERS = [
  { id: 1, nome: 'Ana Gestora',     email: 'gestor@puc.com',    senha: '123456', role: 'GESTOR'    },
  { id: 2, nome: 'Bruno Motorista', email: 'motorista@puc.com', senha: '123456', role: 'MOTORISTA' },
  { id: 3, nome: 'Carla Operadora', email: 'operador@puc.com',  senha: '123456', role: 'OPERADOR'  },
];

export const authService = {
  async login(email, senha) {
    if (USE_MOCK) {
      await new Promise((r) => setTimeout(r, 500));
      const found = MOCK_USERS.find(
        (u) => u.email === email && u.senha === senha
      );
      if (!found) throw new Error('Email ou senha inválidos');
      const { senha: _, ...user } = found;
      return { token: 'mock-jwt-token-' + user.role, user };
    }

    const response = await api.post('/auth/login', { email, senha });
    const data = response.data;

    return {
      token: data.token,
      user: {
        id:    data.id,
        nome:  data.nome,
        role:  data.role,
        email: email,
      },
    };
  },

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },
};