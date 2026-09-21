import api from './api';

const ENDPOINT = '/instructor';

export function listInstructorCourses() {
  return api.get(`${ENDPOINT}/courses`);
}

export function getCourse(id) {
  return api.get(`${ENDPOINT}/courses/${id}`);
}

export function getCoursePreview(id) {
  return api.get(`${ENDPOINT}/courses/${id}/preview`);
}

export function createCourse(data) {
  return api.post(`${ENDPOINT}/courses`, data);
}

export function updateCourse(id, data) {
  return api.patch(`${ENDPOINT}/courses/${id}`, data);
}

export function deleteCourse(id) {
  return api.delete(`${ENDPOINT}/courses/${id}`);
}

export function publishCourse(id) {
  return api.post(`${ENDPOINT}/courses/${id}/publish`);
}

export function archiveCourse(id) {
  return api.post(`${ENDPOINT}/courses/${id}/archive`);
}

export function createModule(courseId, data) {
  return api.post(`${ENDPOINT}/courses/${courseId}/modules`, data);
}

export function updateModule(moduleId, data) {
  return api.patch(`${ENDPOINT}/course-modules/${moduleId}`, data);
}

export function deleteModule(moduleId) {
  return api.delete(`${ENDPOINT}/course-modules/${moduleId}`);
}

export function reorderModules(courseId, order) {
  return api.post(`${ENDPOINT}/courses/${courseId}/modules/reorder`, { order });
}

export function createLesson(moduleId, data) {
  return api.post(`${ENDPOINT}/course-modules/${moduleId}/lessons`, data);
}

export function updateLesson(lessonId, data) {
  return api.patch(`${ENDPOINT}/lessons/${lessonId}`, data);
}

export function deleteLesson(lessonId) {
  return api.delete(`${ENDPOINT}/lessons/${lessonId}`);
}

export function reorderLessons(moduleId, order) {
  return api.post(`${ENDPOINT}/course-modules/${moduleId}/lessons/reorder`, { order });
}

export function createResource(lessonId, data) {
  return api.post(`${ENDPOINT}/lessons/${lessonId}/resources`, data);
}

export function deleteResource(resourceId) {
  return api.delete(`${ENDPOINT}/resources/${resourceId}`);
}

export function createQuiz(moduleId, data) {
  return api.post(`${ENDPOINT}/course-modules/${moduleId}/quizzes`, data);
}

export function updateQuiz(quizId, data) {
  return api.patch(`${ENDPOINT}/quizzes/${quizId}`, data);
}

export function deleteQuiz(quizId) {
  return api.delete(`${ENDPOINT}/quizzes/${quizId}`);
}

export function createQuestion(quizId, data) {
  return api.post(`${ENDPOINT}/quizzes/${quizId}/questions`, data);
}

export function updateQuestion(questionId, data) {
  return api.patch(`${ENDPOINT}/questions/${questionId}`, data);
}

export function deleteQuestion(questionId) {
  return api.delete(`${ENDPOINT}/questions/${questionId}`);
}

export function listInstructorAssignments() {
  return api.get(`${ENDPOINT}/assignments`);
}

export function getInstructorAssignment(assignmentId) {
  return api.get(`${ENDPOINT}/assignments/${encodeURIComponent(assignmentId)}`);
}

export function gradeSubmission(submissionId, data) {
  return api.patch(`${ENDPOINT}/submissions/${encodeURIComponent(submissionId)}/grade`, data);
}

export function createAssignment(moduleId, data) {
  return api.post(`${ENDPOINT}/course-modules/${moduleId}/assignments`, data);
}

export function updateAssignment(assignmentId, data) {
  return api.patch(`${ENDPOINT}/assignments/${assignmentId}`, data);
}

export function deleteAssignment(assignmentId) {
  return api.delete(`${ENDPOINT}/assignments/${assignmentId}`);
}

export function downloadSubmissionFile(submissionId) {
  return api.get(`/submissions/${encodeURIComponent(submissionId)}/file`, { responseType: 'blob' });
}

export function getInstructorAnalytics() {
  return api.get(`${ENDPOINT}/analytics`);
}

export function getCourseAnalytics(courseId) {
  return api.get(`${ENDPOINT}/courses/${encodeURIComponent(courseId)}/analytics`);
}

export function listCourseStudents(courseId) {
  return api.get(`${ENDPOINT}/courses/${encodeURIComponent(courseId)}/students`);
}

export function listInstructorStudents() {
  return api.get(`${ENDPOINT}/students`);
}