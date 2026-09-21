import axios from 'axios';
import { API_BASE_URL } from '../constants';
import { getStoredToken } from '../utils/authStorage';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = getStoredToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const message =
      error.response?.data?.message ||
      'Something went wrong. Please try again.';
    const code = error.response?.data?.code || 'REQUEST_FAILED';
    const status = error.response?.status || 0;
    const err = new Error(message);
    err.code = code;
    err.status = status;
    throw err;
  }
);

export async function getHealth() {
  return api.get('/health');
}

export default api;