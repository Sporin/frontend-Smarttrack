// src/services/driverService.js
import { createApi } from './api';

const USE_MOCK = process.env.REACT_APP_USE_MOCK === 'true';
const api = createApi(process.env.REACT_APP_DRIVER_URL);

const MOCK_MOTORISTAS = [
  { id: 1, nome: 'Bruno Silva',  cnh: '12345678900', status: 'DISPONIVEL',  veiculo: 'Caminhão VW 24.280' },
  { id: 2, nome: 'Carlos Mota',  cnh: '98765432100', status: 'EM_ROTA',     veiculo: 'Furgão Fiat Ducato' },
  { id: 3, nome: 'Diego Santos', cnh: '11122233344', status: 'INDISPONIVEL', veiculo: 'Van Mercedes Sprinter' },
];

export const driverService = {
  // GET /drivers
  async listarMotoristas() {
    if (USE_MOCK) {
      await new Promise((r) => setTimeout(r, 400));
      return MOCK_MOTORISTAS;
    }
    const response = await api.get('/drivers');
    return response.data;
  },

  // GET /drivers/{id}
  async buscarMotorista(id) {
    if (USE_MOCK) {
      await new Promise((r) => setTimeout(r, 300));
      return MOCK_MOTORISTAS.find((m) => m.id === id);
    }
    const response = await api.get(`/drivers/${id}`);
    return response.data;
  },

  // POST /drivers
  async criarMotorista(dados) {
    if (USE_MOCK) {
      await new Promise((r) => setTimeout(r, 500));
      return { id: Date.now(), ...dados, status: 'DISPONIVEL' };
    }
    const response = await api.post('/drivers', dados);
    return response.data;
  },

  // PUT /drivers/atualizar/{id}
  async atualizarMotorista(id, dados) {
    if (USE_MOCK) {
      await new Promise((r) => setTimeout(r, 400));
      return { id, ...dados };
    }
    const response = await api.put(`/drivers/atualizar/${id}`, dados);
    return response.data;
  },

  // DELETE /drivers/{id}
  async deletarMotorista(id) {
    if (USE_MOCK) {
      await new Promise((r) => setTimeout(r, 300));
      return;
    }
    await api.delete(`/drivers/${id}`);
  },
};