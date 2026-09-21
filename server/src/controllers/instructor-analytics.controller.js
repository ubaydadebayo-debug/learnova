import { asyncHandler } from '../utils/asyncHandler.js';
import { sendSuccess } from '../utils/ApiResponse.js';
import { ApiError } from '../utils/ApiError.js';
import {
  getInstructorAnalytics,
  getCourseAnalytics,
  listCourseStudents,
  listInstructorStudents,
} from '../services/analytics.service.js';

export const getAnalyticsController = asyncHandler(async (req, res) => {
  const analytics = await getInstructorAnalytics(req.user.id);
  sendSuccess(res, 200, 'Instructor analytics retrieved successfully', analytics);
});

export const getCourseAnalyticsController = asyncHandler(async (req, res) => {
  const course = await getCourseAnalytics(req.params.courseId);
  if (!course) {
    throw ApiError.notFound('Course not found');
  }
  sendSuccess(res, 200, 'Course analytics retrieved successfully', { course });
});

export const getCourseStudentsController = asyncHandler(async (req, res) => {
  const data = await listCourseStudents(req.params.courseId);
  if (!data) {
    throw ApiError.notFound('Course not found');
  }
  sendSuccess(res, 200, 'Course students retrieved successfully', data);
});

export const getStudentsController = asyncHandler(async (req, res) => {
  const students = await listInstructorStudents(req.user.id);
  sendSuccess(res, 200, 'Students retrieved successfully', { students });
});