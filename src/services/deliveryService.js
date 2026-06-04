// src/services/deliveryService.js
import { createApi } from './api';

const USE_MOCK = process.env.REACT_APP_USE_MOCK === 'true';
const api = createApi(process.env.REACT_APP_DELIVERY_URL);

const MOCK_ENTREGAS = [
  { id: 1, origem: 'São Paulo - SP',    destino: 'Campinas - SP',   status: 'EM_TRANSITO', motorista: 'Bruno',  data: '2025-06-01' },
  { id: 2, origem: 'Rio de Janeiro - RJ', destino: 'Niterói - RJ', status: 'PENDENTE',     motorista: 'Carlos', data: '2025-06-02' },
  { id: 3, origem: 'Curitiba - PR',     destino: 'Londrina - PR',   status: 'ENTREGUE',    motorista: 'Diego',  data: '2025-05-30' },
];

export const deliveryService = {
  async listarEntregas() {
    if (USE_MOCK) {
      await new Promise((r) => setTimeout(r, 400));
      return MOCK_ENTREGAS;
    }
    const response = await api.get('/entregas');
    return response.data;
  },

  async criarEntrega(dados) {
    if (USE_MOCK) {
      await new Promise((r) => setTimeout(r, 500));
      return { id: Date.now(), ...dados, status: 'PENDENTE' };
    }
    const response = await api.post('/entregas', dados);
    return response.data;
  },

  async atualizarStatus(id, status) {
    if (USE_MOCK) {
      await new Promise((r) => setTimeout(r, 300));
      return { id, status };
    }
    const response = await api.patch(`/entregas/${id}/status`, { status });
    return response.data;
  },
};