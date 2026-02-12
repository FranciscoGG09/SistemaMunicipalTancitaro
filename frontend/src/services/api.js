import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000/api';

// Crear instancia de axios
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
});

// Interceptor para agregar token a las solicitudes
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para manejar errores de autenticación
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expirado o inválido
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Funciones específicas de la API
export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/registrar', userData),
  getProfile: () => api.get('/auth/perfil'),
  getAllUsers: () => api.get('/auth/usuarios'),
  updateUser: (id, data) => api.put(`/auth/usuarios/${id}`, data),
  deleteUser: (id) => api.delete(`/auth/usuarios/${id}`),
};

export const reportsAPI = {
  getAll: (params) => api.get('/reportes', { params }),
  getById: (id) => api.get(`/reportes/${id}`),
  create: (data) => api.post('/reportes', data),
  update: (id, data) => api.put(`/reportes/${id}`, data),
  delete: (id) => api.delete(`/reportes/${id}`),
  getStats: () => api.get('/reportes/estadisticas/estadisticas'),
};

export const newsAPI = {
  getAll: (params) => api.get('/noticias', { params }),
  getById: (id) => api.get(`/noticias/${id}`),
  create: (data) => api.post('/noticias', data),
  update: (id, data) => api.put(`/noticias/${id}`, data),
  delete: (id) => api.delete(`/noticias/${id}`),
};

export const emailsAPI = {
  getAll: (params) => api.get('/correos', { params }),
  getSent: (params) => api.get('/correos/enviados', { params }),
  getById: (id) => api.get(`/correos/${id}`),
  send: (data) => api.post('/correos', data),
  markAsRead: (id) => api.put(`/correos/${id}/leer`),
  delete: (id) => api.delete(`/correos/${id}`),
};

export default api;