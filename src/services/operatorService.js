// src/services/operatorService.js
import { createApi } from './api';

const USE_MOCK = process.env.REACT_APP_USE_MOCK === 'true';
const api = createApi('http://localhost:8083/operator-service');

export const operatorService = {
  // GET /operators
  async listarOperadores() {
    if (USE_MOCK) return [];
    const response = await api.get('/operators');
    return response.data;
  },

  // GET /operators/{id}
  async buscarOperador(id) {
    if (USE_MOCK) return null;
    const response = await api.get(`/operators/${id}`);
    return response.data;
  },

  // GET /operators/{id}/monitor
  async monitorarEntregas(id) {
    if (USE_MOCK) return [];
    const response = await api.get(`/operators/${id}/monitor`);
    return response.data;
  },

  // GET /operators/{id}/reports
  async gerarRelatorio(id) {
    if (USE_MOCK) return {};
    const response = await api.get(`/operators/${id}/reports`);
    return response.data;
  },

  // POST /operators
  async criarOperador(dados) {
    if (USE_MOCK) return { id: Date.now(), ...dados };
    const response = await api.post('/operators', dados);
    return response.data;
  },
};