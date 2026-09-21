import api from './api';

const ENDPOINT = '/courses';

export function listCourses(params = {}) {
  const query = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '' && value !== 'all') {
      query.set(key, value);
    }
  });

  const qs = query.toString();
  return api.get(`${ENDPOINT}${qs ? `?${qs}` : ''}`);
}

export function getCourse(identifier) {
  return api.get(`${ENDPOINT}/${encodeURIComponent(identifier)}`);
}