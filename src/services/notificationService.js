// src/services/notificationService.js
import { createApi } from './api';

const USE_MOCK = process.env.REACT_APP_USE_MOCK === 'true';
const api = createApi(process.env.REACT_APP_NOTIFICATION_URL);

const MOCK_NOTIFICACOES = [
  { id: 1, mensagem: 'Entrega #1 saiu para entrega',    lida: false, data: '2025-06-01 08:30' },
  { id: 2, mensagem: 'Motorista Bruno iniciou rota',     lida: false, data: '2025-06-01 09:00' },
  { id: 3, mensagem: 'Entrega #3 concluída com sucesso', lida: true,  data: '2025-05-30 17:45' },
];

export const notificationService = {
  // GET /notifications
  async listarNotificacoes() {
    if (USE_MOCK) {
      await new Promise((r) => setTimeout(r, 300));
      return MOCK_NOTIFICACOES;
    }
    const response = await api.get('/notifications');
    return response.data;
  },

  // GET /notifications/entrega/{entregaId}
  async listarPorEntrega(entregaId) {
    if (USE_MOCK) {
      await new Promise((r) => setTimeout(r, 300));
      return MOCK_NOTIFICACOES;
    }
    const response = await api.get(`/notifications/entrega/${entregaId}`);
    return response.data;
  },

  // POST /notifications
  async criarNotificacao(dados) {
    if (USE_MOCK) {
      await new Promise((r) => setTimeout(r, 300));
      return { id: Date.now(), ...dados, lida: false };
    }
    const response = await api.post('/notifications', dados);
    return response.data;
  },

  // O backend não tem endpoint de marcar como lida ainda
  // Por enquanto mantemos só no frontend
  async marcarComoLida(id) {
    if (USE_MOCK) {
      await new Promise((r) => setTimeout(r, 200));
      return { id, lida: true };
    }
    // Quando o backend implementar: await api.patch(`/notifications/${id}/lida`);
    return { id, lida: true };
  },
};