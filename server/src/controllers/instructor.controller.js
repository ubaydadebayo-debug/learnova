import { asyncHandler } from '../utils/asyncHandler.js';
import { sendSuccess } from '../utils/ApiResponse.js';
import { ApiError } from '../utils/ApiError.js';
import {
  listInstructorCourses,
  createCourse,
  getInstructorCourse,
  updateCourse,
  deleteCourse,
  publishCourse,
  archiveCourse,
} from '../services/course.service.js';
import {
  createModule,
  updateModule,
  deleteModule,
  reorderModules,
} from '../services/module.service.js';
import {
  createLesson,
  updateLesson,
  deleteLesson,
  reorderLessons,
  createResource,
  deleteResource,
} from '../services/lesson.service.js';
import {
  createQuiz,
  updateQuiz,
  deleteQuiz,
  createQuestion,
  updateQuestion,
  deleteQuestion,
} from '../services/quiz.service.js';
import {
  createAssignment,
  updateAssignment,
  deleteAssignment,
} from '../services/assignment.service.js';

export const getCourses = asyncHandler(async (req, res) => {
  const courses = await listInstructorCourses(req.user.id);
  sendSuccess(res, 200, 'Courses retrieved successfully', { courses });
});

export const createCourseController = asyncHandler(async (req, res) => {
  const course = await createCourse(req.user.id, req.body);
  sendSuccess(res, 201, 'Course created successfully', { course });
});

export const getCourseController = asyncHandler(async (req, res) => {
  const course = await getInstructorCourse(req.params.id);
  sendSuccess(res, 200, 'Course retrieved successfully', { course });
});

export const previewCourse = asyncHandler(async (req, res) => {
  const course = await getInstructorCourse(req.params.id);
  sendSuccess(res, 200, 'Course preview retrieved successfully', { course });
});

export const updateCourseController = asyncHandler(async (req, res) => {
  const course = await updateCourse(req.params.id, req.body);
  sendSuccess(res, 200, 'Course updated successfully', { course });
});

export const deleteCourseController = asyncHandler(async (req, res) => {
  await deleteCourse(req.params.id);
  sendSuccess(res, 200, 'Course deleted successfully');
});

export const publishCourseController = asyncHandler(async (req, res) => {
  const course = await publishCourse(req.params.id);
  sendSuccess(res, 200, 'Course published successfully', { course });
});

export const archiveCourseController = asyncHandler(async (req, res) => {
  const course = await archiveCourse(req.params.id);
  sendSuccess(res, 200, 'Course archived successfully', { course });
});

export const createModuleController = asyncHandler(async (req, res) => {
  const module = await createModule(req.course.id, req.body);
  sendSuccess(res, 201, 'Module created successfully', { module });
});

export const updateModuleController = asyncHandler(async (req, res) => {
  const module = await updateModule(req.params.moduleId, req.body);
  sendSuccess(res, 200, 'Module updated successfully', { module });
});

export const deleteModuleController = asyncHandler(async (req, res) => {
  await deleteModule(req.params.moduleId);
  sendSuccess(res, 200, 'Module deleted successfully');
});

export const reorderModulesController = asyncHandler(async (req, res) => {
  const modules = await reorderModules(req.course.id, req.body.order);
  sendSuccess(res, 200, 'Modules reordered successfully', { modules });
});

export const createLessonController = asyncHandler(async (req, res) => {
  const lesson = await createLesson(req.params.moduleId, req.body);
  sendSuccess(res, 201, 'Lesson created successfully', { lesson });
});

export const updateLessonController = asyncHandler(async (req, res) => {
  const lesson = await updateLesson(req.params.lessonId, req.body);
  sendSuccess(res, 200, 'Lesson updated successfully', { lesson });
});

export const deleteLessonController = asyncHandler(async (req, res) => {
  await deleteLesson(req.params.lessonId);
  sendSuccess(res, 200, 'Lesson deleted successfully');
});

export const reorderLessonsController = asyncHandler(async (req, res) => {
  const lessons = await reorderLessons(req.params.moduleId, req.body.order);
  sendSuccess(res, 200, 'Lessons reordered successfully', { lessons });
});

export const createResourceController = asyncHandler(async (req, res) => {
  const resource = await createResource(req.params.lessonId, req.body);
  sendSuccess(res, 201, 'Resource created successfully', { resource });
});

export const deleteResourceController = asyncHandler(async (req, res) => {
  await deleteResource(req.params.resourceId);
  sendSuccess(res, 200, 'Resource deleted successfully');
});

export const createQuizController = asyncHandler(async (req, res) => {
  const quiz = await createQuiz(req.params.moduleId, req.body);
  sendSuccess(res, 201, 'Quiz created successfully', { quiz });
});

export const updateQuizController = asyncHandler(async (req, res) => {
  const quiz = await updateQuiz(req.params.quizId, req.body);
  sendSuccess(res, 200, 'Quiz updated successfully', { quiz });
});

export const deleteQuizController = asyncHandler(async (req, res) => {
  await deleteQuiz(req.params.quizId);
  sendSuccess(res, 200, 'Quiz deleted successfully');
});

export const createQuestionController = asyncHandler(async (req, res) => {
  const question = await createQuestion(req.params.quizId, req.body);
  sendSuccess(res, 201, 'Question created successfully', { question });
});

export const updateQuestionController = asyncHandler(async (req, res) => {
  const question = await updateQuestion(req.params.questionId, req.body);
  sendSuccess(res, 200, 'Question updated successfully', { question });
});

export const deleteQuestionController = asyncHandler(async (req, res) => {
  await deleteQuestion(req.params.questionId);
  sendSuccess(res, 200, 'Question deleted successfully');
});

export const createAssignmentController = asyncHandler(async (req, res) => {
  const assignment = await createAssignment(req.params.moduleId, req.body);
  sendSuccess(res, 201, 'Assignment created successfully', { assignment });
});

export const updateAssignmentController = asyncHandler(async (req, res) => {
  const assignment = await updateAssignment(req.params.assignmentId, req.body);
  sendSuccess(res, 200, 'Assignment updated successfully', { assignment });
});

export const deleteAssignmentController = asyncHandler(async (req, res) => {
  await deleteAssignment(req.params.assignmentId);
  sendSuccess(res, 200, 'Assignment deleted successfully');
});