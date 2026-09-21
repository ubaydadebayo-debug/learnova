import { prisma } from '../config/prisma.js';
import { ApiError } from '../utils/ApiError.js';

// Generic ownership guard: loads a resource by id and verifies the authenticated
// user owns it (an ADMIN is allowed as an override). The loaded resource is
// attached to req.resource for later stages to consume.
// Usage: requireOwnedResource('course', 'instructorId')
export function requireOwnedResource(model, ownerField, paramName = 'id') {
  return async (req, _res, next) => {
    try {
      const id = req.params[paramName];
      const resource = await prisma[model].findUnique({
        where: { id },
        select: { id: true, [ownerField]: true },
      });

      if (!resource) {
        return next(ApiError.notFound(`${model} not found`));
      }

      const isOwner = resource[ownerField] === req.user.id;
      if (!isOwner && req.user.role !== 'ADMIN') {
        return next(ApiError.forbidden('You do not have permission to access this resource'));
      }

      req.resource = resource;
      next();
    } catch (error) {
      next(error);
    }
  };
}

export function requireCourseOwner(paramName = 'id') {
  return async (req, _res, next) => {
    try {
      const course = await prisma.course.findUnique({
        where: { id: req.params[paramName] },
        select: { id: true, title: true, slug: true, instructorId: true, status: true },
      });

      if (!course) {
        return next(ApiError.notFound('Course not found'));
      }

      if (course.instructorId !== req.user.id && req.user.role !== 'ADMIN') {
        return next(ApiError.forbidden('You do not have permission to access this course'));
      }

      req.course = course;
      next();
    } catch (error) {
      next(error);
    }
  };
}

export function requireModuleOwner(paramName = 'moduleId') {
  return async (req, _res, next) => {
    try {
      const module = await prisma.module.findUnique({
        where: { id: req.params[paramName] },
        select: {
          id: true,
          courseId: true,
          course: { select: { instructorId: true, title: true } },
        },
      });

      if (!module) {
        return next(ApiError.notFound('Module not found'));
      }

      if (req.params.courseId && req.params.courseId !== module.courseId) {
        return next(ApiError.notFound('Module not found in this course'));
      }

      if (module.course.instructorId !== req.user.id && req.user.role !== 'ADMIN') {
        return next(ApiError.forbidden('You do not have permission to access this module'));
      }

      req.module = module;
      req.course = module.course;
      next();
    } catch (error) {
      next(error);
    }
  };
}

export function requireLessonOwner(paramName = 'lessonId') {
  return async (req, _res, next) => {
    try {
      const lesson = await prisma.lesson.findUnique({
        where: { id: req.params[paramName] },
        select: {
          id: true,
          moduleId: true,
          module: { select: { id: true, course: { select: { id: true, instructorId: true, title: true } } } },
        },
      });

      if (!lesson) {
        return next(ApiError.notFound('Lesson not found'));
      }

      if (lesson.module.course.instructorId !== req.user.id && req.user.role !== 'ADMIN') {
        return next(ApiError.forbidden('You do not have permission to access this lesson'));
      }

      req.lesson = lesson;
      req.module = lesson.module;
      req.course = lesson.module.course;
      next();
    } catch (error) {
      next(error);
    }
  };
}

export function requireQuizOwner(paramName = 'quizId') {
  return async (req, _res, next) => {
    try {
      const quiz = await prisma.quiz.findUnique({
        where: { id: req.params[paramName] },
        select: {
          id: true,
          module: { select: { id: true, course: { select: { id: true, instructorId: true, title: true } } } },
        },
      });

      if (!quiz) {
        return next(ApiError.notFound('Quiz not found'));
      }

      if (quiz.module.course.instructorId !== req.user.id && req.user.role !== 'ADMIN') {
        return next(ApiError.forbidden('You do not have permission to access this quiz'));
      }

      req.quiz = quiz;
      req.module = quiz.module;
      req.course = quiz.module.course;
      next();
    } catch (error) {
      next(error);
    }
  };
}

export function requireQuestionOwner(paramName = 'questionId') {
  return async (req, _res, next) => {
    try {
      const question = await prisma.question.findUnique({
        where: { id: req.params[paramName] },
        select: {
          id: true,
          quiz: { select: { id: true, module: { select: { course: { select: { instructorId: true } } } } } },
        },
      });

      if (!question) {
        return next(ApiError.notFound('Question not found'));
      }

      if (question.quiz.module.course.instructorId !== req.user.id && req.user.role !== 'ADMIN') {
        return next(ApiError.forbidden('You do not have permission to access this question'));
      }

      req.question = question;
      req.quiz = question.quiz;
      next();
    } catch (error) {
      next(error);
    }
  };
}

export function requireAssignmentOwner(paramName = 'assignmentId') {
  return async (req, _res, next) => {
    try {
      const assignment = await prisma.assignment.findUnique({
        where: { id: req.params[paramName] },
        select: {
          id: true,
          module: { select: { id: true, course: { select: { id: true, instructorId: true, title: true } } } },
        },
      });

      if (!assignment) {
        return next(ApiError.notFound('Assignment not found'));
      }

      if (assignment.module.course.instructorId !== req.user.id && req.user.role !== 'ADMIN') {
        return next(ApiError.forbidden('You do not have permission to access this assignment'));
      }

      req.assignment = assignment;
      req.module = assignment.module;
      req.course = assignment.module.course;
      next();
    } catch (error) {
      next(error);
    }
  };
}

export function requireResourceOwner(paramName = 'resourceId') {
  return async (req, _res, next) => {
    try {
      const resource = await prisma.resource.findUnique({
        where: { id: req.params[paramName] },
        select: {
          id: true,
          lesson: { select: { id: true, module: { select: { course: { select: { instructorId: true } } } } } },
        },
      });

      if (!resource) {
        return next(ApiError.notFound('Resource not found'));
      }

      if (resource.lesson.module.course.instructorId !== req.user.id && req.user.role !== 'ADMIN') {
        return next(ApiError.forbidden('You do not have permission to access this resource'));
      }

      req.resource = resource;
      next();
    } catch (error) {
      next(error);
    }
  };
}