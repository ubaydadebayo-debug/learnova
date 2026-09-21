import api from './api';

const ENROLLMENTS_ENDPOINT = '/enrollments';
const PROGRESS_ENDPOINT = '/progress';
const QUIZZES_ENDPOINT = '/quizzes';
const ASSIGNMENTS_ENDPOINT = '/assignments';

export function listMyCourses() {
  return api.get(ENROLLMENTS_ENDPOINT);
}

export function getCourseEnrollment(courseId) {
  return api.get(`${ENROLLMENTS_ENDPOINT}/${encodeURIComponent(courseId)}`);
}

export function enrollInCourse(courseId) {
  return api.post(ENROLLMENTS_ENDPOINT, { courseId });
}

export function getProgressSummary() {
  return api.get(`${PROGRESS_ENDPOINT}/summary`);
}

export function completeLesson(lessonId) {
  return api.post(`${PROGRESS_ENDPOINT}/lessons/${encodeURIComponent(lessonId)}/complete`);
}

export function uncompleteLesson(lessonId) {
  return api.post(`${PROGRESS_ENDPOINT}/lessons/${encodeURIComponent(lessonId)}/uncomplete`);
}

export function getQuiz(quizId) {
  return api.get(`${QUIZZES_ENDPOINT}/${encodeURIComponent(quizId)}`);
}

export function submitQuiz(quizId, answers) {
  return api.post(`${QUIZZES_ENDPOINT}/${encodeURIComponent(quizId)}/attempts`, { answers });
}

export function listAssignments() {
  return api.get(ASSIGNMENTS_ENDPOINT);
}

export function getAssignment(assignmentId) {
  return api.get(`${ASSIGNMENTS_ENDPOINT}/${encodeURIComponent(assignmentId)}`);
}

export function submitAssignment(assignmentId, { text, file } = {}) {
  if (file) {
    const form = new FormData();
    if (text) form.append('text', text);
    form.append('file', file);
    return api.post(`${ASSIGNMENTS_ENDPOINT}/${encodeURIComponent(assignmentId)}/submissions`, form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  }
  return api.post(`${ASSIGNMENTS_ENDPOINT}/${encodeURIComponent(assignmentId)}/submissions`, { text });
}

export function downloadSubmissionFile(submissionId) {
  return api.get(`/submissions/${encodeURIComponent(submissionId)}/file`, { responseType: 'blob' });
}

export function listCertificates() {
  return api.get('/certificates');
}

export function verifyCertificate(verificationCode) {
  return api.get(`/certificates/verify/${encodeURIComponent(verificationCode)}`);
}

export function getCertificate(certificateId) {
  return api.get(`/certificates/${encodeURIComponent(certificateId)}`);
}

export function downloadCertificate(certificateId) {
  return api.get(`/certificates/${encodeURIComponent(certificateId)}/download`, { responseType: 'blob' });
}

export function generateCertificatePreview(courseId) {
  return api.get(`/certificates/preview/${encodeURIComponent(courseId)}`);
}