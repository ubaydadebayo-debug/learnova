import { Router } from 'express';
import { authenticate } from '../middleware/authenticate.js';
import { loadAuthenticatedUser, requireAdmin } from '../middleware/authorize.js';
import {
  getCategories,
  createCategoryController,
  updateCategoryController,
  deleteCategoryController,
  getCourses,
  updateCourseController,
  deleteCourseController,
  getUsers,
  updateUserStatusController,
  getOverview,
  getReports,
  getEnrollments,
  updateEnrollmentStatusController,
  getCertificates,
  getQuizzes,
  getAssignments,
  getActivity,
} from '../controllers/admin.controller.js';
import {
  createCategoryValidation,
  updateCategoryValidation,
  idParamValidation,
} from '../validators/category.validator.js';
import {
  adminListCoursesValidation,
  adminUpdateCourseValidation,
} from '../validators/course.validator.js';
import {
  adminListUsersValidation,
  updateUserStatusValidation,
} from '../validators/user.validator.js';
import {
  adminListEnrollmentsValidation,
  adminEnrollmentStatusUpdateValidation,
  adminListCertificatesValidation,
  adminListQuizzesValidation,
  adminListAssignmentsValidation,
  adminActivityValidation,
} from '../validators/admin-oversight.validator.js';

const router = Router();

router.use(authenticate, loadAuthenticatedUser, requireAdmin);

router.get('/overview', getOverview);
router.get('/reports', getReports);
router.get('/activity', adminActivityValidation, getActivity);
router.get('/categories', getCategories);
router.post('/categories', createCategoryValidation, createCategoryController);
router.patch('/categories/:id', idParamValidation, updateCategoryValidation, updateCategoryController);
router.delete('/categories/:id', idParamValidation, deleteCategoryController);

router.get('/courses', adminListCoursesValidation, getCourses);
router.patch('/courses/:id', idParamValidation, adminUpdateCourseValidation, updateCourseController);
router.delete('/courses/:id', idParamValidation, deleteCourseController);

router.get('/users', adminListUsersValidation, getUsers);
router.patch('/users/:id/status', updateUserStatusValidation, updateUserStatusController);

router.get('/enrollments', adminListEnrollmentsValidation, getEnrollments);
router.patch('/enrollments/:id/status', adminEnrollmentStatusUpdateValidation, updateEnrollmentStatusController);
router.get('/certificates', adminListCertificatesValidation, getCertificates);
router.get('/quizzes', adminListQuizzesValidation, getQuizzes);
router.get('/assignments', adminListAssignmentsValidation, getAssignments);

export default router;