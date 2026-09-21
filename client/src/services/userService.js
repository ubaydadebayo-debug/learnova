import api from './api';

export function getProfile() {
  return api.get('/users/profile');
}

export function updateProfile(payload) {
  return api.patch('/users/profile', payload);
}

export function changePassword(payload) {
  return api.patch('/users/password', payload);
}

export function updatePreferences(payload) {
  return api.patch('/users/preferences', payload);
}