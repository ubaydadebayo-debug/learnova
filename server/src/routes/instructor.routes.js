import { Router } from 'express';
import { authenticate } from '../middleware/authenticate.js';
import { loadAuthenticatedUser, requireInstructor, requireApprovedInstructor } from '../middleware/authorize.js';
import { requireCourseOwner, requireModuleOwner, requireLessonOwner, requireResourceOwner, requireQuizOwner, requireQuestionOwner, requireAssignmentOwner } from '../middleware/ownership.js';
import {
  getCourses,
  createCourseController,
  getCourseController,
  previewCourse,
  updateCourseController,
  deleteCourseController,
  publishCourseController,
  archiveCourseController,
  createModuleController,
  updateModuleController,
  deleteModuleController,
  reorderModulesController,
  createLessonController,
  updateLessonController,
  deleteLessonController,
  reorderLessonsController,
  createResourceController,
  deleteResourceController,
  createQuizController,
  updateQuizController,
  deleteQuizController,
  createQuestionController,
  updateQuestionController,
  deleteQuestionController,
  createAssignmentController,
  updateAssignmentController,
  deleteAssignmentController,
} from '../controllers/instructor.controller.js';
import {
  createCourseValidation,
  updateCourseValidation,
} from '../validators/course.validator.js';
import { idParamValidation, paramValidation } from '../validators/category.validator.js';
import {
  createModuleValidation,
  moduleBodyValidation,
  reorderValidation,
} from '../validators/module.validator.js';
import {
  createLessonValidation,
  lessonBodyValidation,
  createResourceValidation,
} from '../validators/lesson.validator.js';
import {
  assignmentIdParamValidation,
  gradeSubmissionValidation,
  createAssignmentValidation,
  assignmentBodyValidation,
} from '../validators/instructor-assignment.validator.js';
import {
  createQuizValidation,
  quizBodyValidation,
  createQuestionValidation,
  questionBodyValidation,
  quizIdParamValidation,
  questionIdParamValidation,
} from '../validators/instructor-quiz.validator.js';
import {
  getInstructorAssignmentController,
  gradeSubmissionController,
  listInstructorAssignmentsController,
} from '../controllers/instructor-assignment.controller.js';
import {
  getAnalyticsController,
  getCourseAnalyticsController,
  getCourseStudentsController,
  getStudentsController,
} from '../controllers/instructor-analytics.controller.js';

const router = Router();

router.use(authenticate, loadAuthenticatedUser, requireInstructor, requireApprovedInstructor);

router.get('/analytics', getAnalyticsController);
router.get('/students', getStudentsController);
router.get('/courses/:courseId/analytics', requireCourseOwner('courseId'), getCourseAnalyticsController);
router.get('/courses/:courseId/students', requireCourseOwner('courseId'), getCourseStudentsController);

router.get('/courses', getCourses);
router.post('/courses', createCourseValidation, createCourseController);
router.get('/courses/:id', requireCourseOwner(), getCourseController);
router.get('/courses/:id/preview', requireCourseOwner(), previewCourse);
router.patch('/courses/:id', requireCourseOwner(), updateCourseValidation, updateCourseController);
router.delete('/courses/:id', requireCourseOwner(), idParamValidation, deleteCourseController);
router.post('/courses/:id/publish', requireCourseOwner(), idParamValidation, publishCourseController);
router.post('/courses/:id/archive', requireCourseOwner(), idParamValidation, archiveCourseController);

router.post('/courses/:courseId/modules', requireCourseOwner('courseId'), createModuleValidation, createModuleController);
router.post('/courses/:courseId/modules/reorder', requireCourseOwner('courseId'), reorderValidation, reorderModulesController);
router.patch('/course-modules/:moduleId', requireModuleOwner(), moduleBodyValidation, updateModuleController);
router.delete('/course-modules/:moduleId', requireModuleOwner(), paramValidation('moduleId'), deleteModuleController);

router.post('/course-modules/:moduleId/lessons', requireModuleOwner(), createLessonValidation, createLessonController);
router.post('/course-modules/:moduleId/lessons/reorder', requireModuleOwner(), reorderValidation, reorderLessonsController);
router.patch('/lessons/:lessonId', requireLessonOwner(), lessonBodyValidation, updateLessonController);
router.delete('/lessons/:lessonId', requireLessonOwner(), paramValidation('lessonId'), deleteLessonController);

router.post('/lessons/:lessonId/resources', requireLessonOwner(), createResourceValidation, createResourceController);
router.delete('/resources/:resourceId', requireResourceOwner(), paramValidation('resourceId'), deleteResourceController);

router.post('/course-modules/:moduleId/quizzes', requireModuleOwner(), createQuizValidation, createQuizController);
router.patch('/quizzes/:quizId', requireQuizOwner(), quizIdParamValidation, quizBodyValidation, updateQuizController);
router.delete('/quizzes/:quizId', requireQuizOwner(), quizIdParamValidation, deleteQuizController);

router.post('/quizzes/:quizId/questions', requireQuizOwner(), quizIdParamValidation, createQuestionValidation, createQuestionController);
router.patch('/questions/:questionId', requireQuestionOwner(), questionBodyValidation, updateQuestionController);
router.delete('/questions/:questionId', requireQuestionOwner(), questionIdParamValidation, deleteQuestionController);

router.post('/course-modules/:moduleId/assignments', requireModuleOwner(), createAssignmentValidation, createAssignmentController);
router.patch('/assignments/:assignmentId', requireAssignmentOwner(), assignmentIdParamValidation, assignmentBodyValidation, updateAssignmentController);
router.delete('/assignments/:assignmentId', requireAssignmentOwner(), assignmentIdParamValidation, deleteAssignmentController);

router.get('/assignments', listInstructorAssignmentsController);
router.get('/assignments/:assignmentId', assignmentIdParamValidation, getInstructorAssignmentController);
router.patch('/submissions/:submissionId/grade', gradeSubmissionValidation, gradeSubmissionController);

export default router;