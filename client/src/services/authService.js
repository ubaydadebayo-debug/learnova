import api from './api';

const ENDPOINT = '/auth';

export function register({ firstName, lastName, email, password, confirmPassword, role }) {
  return api.post(`${ENDPOINT}/register`, {
    firstName,
    lastName,
    email,
    password,
    confirmPassword,
    role,
  });
}

export function login({ email, password }) {
  return api.post(`${ENDPOINT}/login`, { email, password });
}

export function getCurrentUser() {
  return api.get(`${ENDPOINT}/me`);
}

export function logout() {
  return api.post(`${ENDPOINT}/logout`);
}