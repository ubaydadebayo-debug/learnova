import { asyncHandler } from '../utils/asyncHandler.js';
import { sendSuccess } from '../utils/ApiResponse.js';
import { ApiError } from '../utils/ApiError.js';
import { prisma } from '../config/prisma.js';
import {
  listCategories,
  createCategory,
  updateCategory,
  deleteCategory,
} from '../services/category.service.js';
import { listAdminCourses, adminUpdateCourse, deleteCourse } from '../services/course.service.js';
import { listAdminUsers, updateUserStatus } from '../services/admin-user.service.js';
import {
  listAdminEnrollments,
  updateEnrollmentStatus,
  listAdminCertificates,
  listAdminQuizzes,
  listAdminAssignments,
  getRecentActivity,
} from '../services/admin-oversight.service.js';

export const getCategories = asyncHandler(async (_req, res) => {
  const categories = await listCategories();
  sendSuccess(res, 200, 'Categories retrieved successfully', { categories });
});

export const getOverview = asyncHandler(async (_req, res) => {
  const [users, students, instructors, pendingInstructors, courses, publishedCourses, enrollments, completedEnrollments, certificates] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { role: 'STUDENT', status: 'ACTIVE' } }),
    prisma.user.count({ where: { role: 'INSTRUCTOR', status: 'ACTIVE' } }),
    prisma.user.count({ where: { role: 'INSTRUCTOR', status: 'PENDING' } }),
    prisma.course.count(),
    prisma.course.count({ where: { status: 'PUBLISHED' } }),
    prisma.enrollment.count({ where: { status: { not: 'CANCELLED' } } }),
    prisma.enrollment.count({ where: { status: 'COMPLETED' } }),
    prisma.certificate.count(),
  ]);

  sendSuccess(res, 200, 'Admin overview retrieved successfully', {
    metrics: { users, students, instructors, pendingInstructors, courses, publishedCourses, enrollments, completedEnrollments, certificates },
  });
});

export const getReports = asyncHandler(async (_req, res) => {
  const [enrollments, submissions, certificates, quizAttempts] = await Promise.all([
    prisma.enrollment.groupBy({ by: ['status'], _count: { _all: true } }),
    prisma.submission.groupBy({ by: ['status'], _count: { _all: true } }),
    prisma.certificate.count(),
    prisma.quizAttempt.count({ where: { submittedAt: { not: null } } }),
  ]);

  sendSuccess(res, 200, 'Reports retrieved successfully', {
    reports: {
      enrollments: Object.fromEntries(enrollments.map((entry) => [entry.status, entry._count._all])),
      submissions: Object.fromEntries(submissions.map((entry) => [entry.status, entry._count._all])),
      certificates,
      submittedQuizAttempts: quizAttempts,
    },
  });
});

export const createCategoryController = asyncHandler(async (req, res) => {
  const category = await createCategory(req.body);
  sendSuccess(res, 201, 'Category created successfully', { category });
});

export const updateCategoryController = asyncHandler(async (req, res) => {
  const category = await updateCategory(req.params.id, req.body);
  sendSuccess(res, 200, 'Category updated successfully', { category });
});

export const deleteCategoryController = asyncHandler(async (req, res) => {
  await deleteCategory(req.params.id);
  sendSuccess(res, 200, 'Category deleted successfully');
});

export const getCourses = asyncHandler(async (req, res) => {
  const { search, status, instructor, page, limit } = req.query;
  const data = await listAdminCourses({
    search,
    status,
    instructor,
    page: page !== undefined ? Number(page) : 1,
    limit: limit !== undefined ? Number(limit) : 12,
  });
  sendSuccess(res, 200, 'Courses retrieved successfully', data);
});

export const updateCourseController = asyncHandler(async (req, res) => {
  const { status, title, categoryId, level } = req.body;
  const course = await adminUpdateCourse(req.params.id, { status, title, categoryId, level });
  sendSuccess(res, 200, 'Course updated successfully', { course });
});

export const deleteCourseController = asyncHandler(async (req, res) => {
  await deleteCourse(req.params.id);
  sendSuccess(res, 200, 'Course deleted successfully');
});

export const getUsers = asyncHandler(async (req, res) => {
  const { search, role, status, page, limit } = req.query;
  const data = await listAdminUsers({
    search,
    role,
    status,
    page: page !== undefined ? Number(page) : 1,
    limit: limit !== undefined ? Number(limit) : 20,
  });
  sendSuccess(res, 200, 'Users retrieved successfully', data);
});

export const updateUserStatusController = asyncHandler(async (req, res) => {
  const user = await updateUserStatus(req.user.id, req.params.id, req.body.status);
  sendSuccess(res, 200, 'User status updated successfully', { user });
});

export const getEnrollments = asyncHandler(async (req, res) => {
  const { search, status, page, limit } = req.query;
  const data = await listAdminEnrollments({
    search,
    status,
    page: page !== undefined ? Number(page) : 1,
    limit: limit !== undefined ? Number(limit) : 20,
  });
  sendSuccess(res, 200, 'Enrollments retrieved successfully', data);
});

export const updateEnrollmentStatusController = asyncHandler(async (req, res) => {
  const enrollment = await updateEnrollmentStatus(req.params.id, req.body.status);
  sendSuccess(res, 200, 'Enrollment status updated successfully', { enrollment });
});

export const getCertificates = asyncHandler(async (req, res) => {
  const { search, page, limit } = req.query;
  const data = await listAdminCertificates({
    search,
    page: page !== undefined ? Number(page) : 1,
    limit: limit !== undefined ? Number(limit) : 20,
  });
  sendSuccess(res, 200, 'Certificates retrieved successfully', data);
});

export const getQuizzes = asyncHandler(async (req, res) => {
  const { search, page, limit } = req.query;
  const data = await listAdminQuizzes({
    search,
    page: page !== undefined ? Number(page) : 1,
    limit: limit !== undefined ? Number(limit) : 20,
  });
  sendSuccess(res, 200, 'Quizzes retrieved successfully', data);
});

export const getAssignments = asyncHandler(async (req, res) => {
  const { search, page, limit } = req.query;
  const data = await listAdminAssignments({
    search,
    page: page !== undefined ? Number(page) : 1,
    limit: limit !== undefined ? Number(limit) : 20,
  });
  sendSuccess(res, 200, 'Assignments retrieved successfully', data);
});

export const getActivity = asyncHandler(async (req, res) => {
  const activity = await getRecentActivity({ limit: req.query.limit !== undefined ? Number(req.query.limit) : 10 });
  sendSuccess(res, 200, 'Recent activity retrieved successfully', { activity });
});