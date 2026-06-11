// src/services/deliveryService.js
import { createApi } from './api';

const USE_MOCK = process.env.REACT_APP_USE_MOCK === 'true';
const api = createApi('http://localhost:8081/delivery-service');

const MOCK_ENTREGAS = [
  { id: 1, status: 'EM_TRANSITO', motoristaId: 2, operadorId: 3, dataEnvio: '2025-06-01' },
  { id: 2, status: 'PENDENTE',    motoristaId: 2, operadorId: 3, dataEnvio: '2025-06-02' },
  { id: 3, status: 'ENTREGUE',    motoristaId: 2, operadorId: 3, dataEnvio: '2025-05-30' },
];

export const deliveryService = {
  async listarEntregas() {
    if (USE_MOCK) {
      await new Promise((r) => setTimeout(r, 400));
      return MOCK_ENTREGAS;
    }
    const response = await api.get('/deliveries');
    return response.data;
  },

  async buscarEntrega(id) {
    if (USE_MOCK) {
      await new Promise((r) => setTimeout(r, 300));
      return MOCK_ENTREGAS.find((e) => e.id === id);
    }
    const response = await api.get(`/deliveries/${id}`);
    return response.data;
  },

  async listarPorMotorista(motoristaId) {
    if (USE_MOCK) {
      await new Promise((r) => setTimeout(r, 400));
      return MOCK_ENTREGAS;
    }
    const response = await api.get(`/deliveries/motorista/${motoristaId}`);
    return response.data;
  },

  // POST /deliveries
  // dto esperado: { motoristaId, operadorId, dataEnvio }
  async criarEntrega(dados) {
    if (USE_MOCK) {
      await new Promise((r) => setTimeout(r, 500));
      return { id: Date.now(), ...dados, status: 'PENDENTE' };
    }
    const response = await api.post('/deliveries', dados);
    return response.data;
  },

  async atualizarStatus(id, status) {
    if (USE_MOCK) {
      await new Promise((r) => setTimeout(r, 300));
      return { id, status };
    }
    const response = await api.put(`/deliveries/${id}/status`, { status });
    return response.data;
  },
};