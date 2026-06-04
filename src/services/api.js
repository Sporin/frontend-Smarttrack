// src/services/api.js
// Este arquivo é o "tradutor" central entre o frontend e os microserviços.
// Ele configura o Axios (biblioteca de requisições HTTP) e injeta
// o token JWT automaticamente em todas as requisições.

import axios from 'axios';

// Função que cria uma "instância" do Axios para cada microserviço
// baseUrl = endereço do microserviço (ex: http://localhost:8081)
export function createApi(baseUrl) {
  const instance = axios.create({
    baseURL: baseUrl,
    headers: {
      'Content-Type': 'application/json',
    },
  });

  // Interceptor: roda antes de TODA requisição
  // Pega o token salvo no navegador e coloca no cabeçalho automaticamente
  instance.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  });

  // Interceptor: roda depois de TODA resposta
  // Se o backend retornar 401 (não autorizado), desloga o usuário
  instance.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error.response?.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
      }
      return Promise.reject(error);
    }
  );

  return instance;
}