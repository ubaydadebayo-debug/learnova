import api from './api';

const ENDPOINT = '/admin';

export function getOverview() {
  return api.get(`${ENDPOINT}/overview`);
}

export function getReports() {
  return api.get(`${ENDPOINT}/reports`);
}

export function listCategories() {
  return api.get(`${ENDPOINT}/categories`);
}

export function createCategory(data) {
  return api.post(`${ENDPOINT}/categories`, data);
}

export function updateCategory(id, data) {
  return api.patch(`${ENDPOINT}/categories/${id}`, data);
}

export function deleteCategory(id) {
  return api.delete(`${ENDPOINT}/categories/${id}`);
}

export function listCourses(params = {}) {
  const query = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '' && value !== 'all') {
      query.set(key, value);
    }
  });

  const qs = query.toString();
  return api.get(`${ENDPOINT}/courses${qs ? `?${qs}` : ''}`);
}

export function updateCourse(id, data) {
  return api.patch(`${ENDPOINT}/courses/${id}`, data);
}

export function deleteCourse(id) {
  return api.delete(`${ENDPOINT}/courses/${id}`);
}

export function listUsers(params = {}) {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '' && value !== 'all') query.set(key, value);
  });
  const qs = query.toString();
  return api.get(`${ENDPOINT}/users${qs ? `?${qs}` : ''}`);
}

export function updateUserStatus(id, status) {
  return api.patch(`${ENDPOINT}/users/${encodeURIComponent(id)}/status`, { status });
}

export function getActivity(params = {}) {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') query.set(key, value);
  });
  const qs = query.toString();
  return api.get(`${ENDPOINT}/activity${qs ? `?${qs}` : ''}`);
}

export function listEnrollments(params = {}) {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '' && value !== 'all') query.set(key, value);
  });
  const qs = query.toString();
  return api.get(`${ENDPOINT}/enrollments${qs ? `?${qs}` : ''}`);
}

export function updateEnrollmentStatus(id, status) {
  return api.patch(`${ENDPOINT}/enrollments/${encodeURIComponent(id)}/status`, { status });
}

export function listCertificates(params = {}) {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '' && value !== 'all') query.set(key, value);
  });
  const qs = query.toString();
  return api.get(`${ENDPOINT}/certificates${qs ? `?${qs}` : ''}`);
}

export function listQuizzes(params = {}) {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '' && value !== 'all') query.set(key, value);
  });
  const qs = query.toString();
  return api.get(`${ENDPOINT}/quizzes${qs ? `?${qs}` : ''}`);
}

export function listAssignments(params = {}) {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '' && value !== 'all') query.set(key, value);
  });
  const qs = query.toString();
  return api.get(`${ENDPOINT}/assignments${qs ? `?${qs}` : ''}`);
}