import { asyncHandler } from '../utils/asyncHandler.js';
import { sendSuccess } from '../utils/ApiResponse.js';
import { ApiError } from '../utils/ApiError.js';
import { listPublishedCourses, getPublishedCourse } from '../services/course.service.js';

export const getCourses = asyncHandler(async (req, res) => {
  const {
    search,
    category,
    level,
    instructor,
    minRating,
    minDuration,
    maxDuration,
    sort,
    page,
    limit,
  } = req.query;

  const data = await listPublishedCourses({
    search,
    category,
    level,
    instructor,
    minRating: minRating !== undefined ? Number(minRating) : undefined,
    minDuration: minDuration !== undefined ? Number(minDuration) : undefined,
    maxDuration: maxDuration !== undefined ? Number(maxDuration) : undefined,
    sort,
    page: page !== undefined ? Number(page) : 1,
    limit: limit !== undefined ? Number(limit) : 12,
  });

  sendSuccess(res, 200, 'Courses retrieved successfully', data);
});

export const getCourse = asyncHandler(async (req, res) => {
  const course = await getPublishedCourse(req.params.id);

  if (!course) {
    throw ApiError.notFound('Course not found');
  }

  sendSuccess(res, 200, 'Course retrieved successfully', { course });
});