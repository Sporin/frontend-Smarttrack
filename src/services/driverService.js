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
  async listarMotoristas() {
    if (USE_MOCK) {
      await new Promise((r) => setTimeout(r, 400));
      return MOCK_MOTORISTAS;
    }
    const response = await api.get('/motoristas');
    return response.data;
  },

  async buscarMotorista(id) {
    if (USE_MOCK) {
      await new Promise((r) => setTimeout(r, 300));
      return MOCK_MOTORISTAS.find((m) => m.id === id);
    }
    const response = await api.get(`/motoristas/${id}`);
    return response.data;
  },
};