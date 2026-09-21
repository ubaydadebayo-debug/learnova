import { body, param } from 'express-validator';
import { validate } from './auth.validator.js';

export const assignmentIdParamValidation = [
  param('assignmentId').isString().trim().isLength({ min: 1, max: 100 }),
  validate,
];

export const submissionIdParamValidation = [
  param('submissionId').isString().trim().isLength({ min: 1, max: 100 }),
  validate,
];

export const submitAssignmentValidation = [
  ...assignmentIdParamValidation,
  body('text')
    .optional({ values: 'falsy' })
    .trim()
    .isLength({ max: 30000 })
    .withMessage('Submission text must be under 30,000 characters'),
  validate,
];