// src/services/authService.js
import { createApi } from './api';

const USE_MOCK = process.env.REACT_APP_USE_MOCK === 'true';

// Login sempre vai para o driver-service (:8082)
const api = createApi(process.env.REACT_APP_DRIVER_URL);

const MOCK_USERS = [
  { id: 1, nome: 'Ana Gestora',     email: 'gestor@puc.com',    senha: '123456', role: 'GESTOR'    },
  { id: 2, nome: 'Bruno Motorista', email: 'motorista@puc.com', senha: '123456', role: 'MOTORISTA' },
  { id: 3, nome: 'Carla Operadora', email: 'operador@puc.com',  senha: '123456', role: 'OPERADOR'  },
];

export const authService = {
  // POST /auth/login
  // Envia: { email, senha }
  // Recebe: { token, role, nome, id }
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

    // Chama o backend real
    const response = await api.post('/auth/login', { email, senha });
    const data = response.data;

    // Adapta o formato do backend para o formato usado no frontend
    // Backend retorna: { token, role, nome, id }
    // Frontend usa: { token, user: { id, nome, role, email } }
    return {
      token: data.token,
      user: {
        id:    data.id,
        nome:  data.nome,
        role:  data.role,
        email: email, // o backend não retorna o email, então usamos o que foi digitado
      },
    };
  },

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },
};