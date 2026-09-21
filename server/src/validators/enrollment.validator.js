import { body, param } from 'express-validator';
import { validate } from './auth.validator.js';

export const createEnrollmentValidation = [
  body('courseId').isString().notEmpty().withMessage('courseId is required'),
  validate,
];

export const courseIdParamValidation = [
  param('courseId').isString().trim().isLength({ min: 1, max: 100 }),
  validate,
];

export const lessonIdParamValidation = [
  param('lessonId').isString().trim().isLength({ min: 1, max: 100 }),
  validate,
];