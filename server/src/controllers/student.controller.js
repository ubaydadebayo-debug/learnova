import { asyncHandler } from '../utils/asyncHandler.js';
import { sendSuccess } from '../utils/ApiResponse.js';
import {
  enrollStudent,
  cancelEnrollment,
  listMyEnrollments,
  getEnrollmentByCourse,
} from '../services/enrollment.service.js';
import { markLessonComplete, markLessonIncomplete, getProgressSummary } from '../services/progress.service.js';

export const enroll = asyncHandler(async (req, res) => {
  const enrollment = await enrollStudent(req.user.id, req.body.courseId);
  sendSuccess(res, 201, 'Enrolled successfully', { enrollment });
});

export const listMy = asyncHandler(async (req, res) => {
  const courses = await listMyEnrollments(req.user.id);
  sendSuccess(res, 200, 'Your courses retrieved successfully', { courses });
});

export const getByCourse = asyncHandler(async (req, res) => {
  const data = await getEnrollmentByCourse(req.user.id, req.params.courseId);
  sendSuccess(res, 200, 'Course enrollment retrieved successfully', data);
});

export const cancel = asyncHandler(async (req, res) => {
  const enrollment = await cancelEnrollment(req.user.id, req.params.courseId);
  sendSuccess(res, 200, 'Enrollment cancelled', { enrollment });
});

export const completeLesson = asyncHandler(async (req, res) => {
  const result = await markLessonComplete(req.user.id, req.params.lessonId);
  sendSuccess(res, 200, 'Lesson completed', result);
});

export const uncompleteLesson = asyncHandler(async (req, res) => {
  const result = await markLessonIncomplete(req.user.id, req.params.lessonId);
  sendSuccess(res, 200, 'Lesson uncompleted', result);
});

export const summary = asyncHandler(async (_req, res) => {
  const data = await getProgressSummary(_req.user.id);
  sendSuccess(res, 200, 'Progress summary retrieved successfully', data);
});