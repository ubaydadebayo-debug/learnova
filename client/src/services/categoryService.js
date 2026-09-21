import api from './api';

const ENDPOINT = '/categories';

export function listCategories() {
  return api.get(ENDPOINT);
}