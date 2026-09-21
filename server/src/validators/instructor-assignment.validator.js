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

export const gradeSubmissionValidation = [
  ...submissionIdParamValidation,
  body('grade').isInt({ min: 0, max: 100000 }).withMessage('Grade must be a non-negative integer'),
  body('feedback').optional({ nullable: true }).isString().isLength({ max: 10000 }).withMessage('Feedback is too long'),
  validate,
];

export const createAssignmentValidation = [
  body('title')
    .trim()
    .notEmpty()
    .withMessage('Assignment title is required')
    .isLength({ max: 150 })
    .withMessage('Assignment title must be under 150 characters'),
  body('instructions').optional({ nullable: true }).isString().isLength({ max: 20000 }).withMessage('Instructions are too long'),
  body('dueDate').optional({ nullable: true }).isISO8601().withMessage('A valid due date is required'),
  body('points').optional().isInt({ min: 1, max: 100000 }).withMessage('Points must be a positive integer'),
  validate,
];

export const assignmentBodyValidation = [
  body('title')
    .optional()
    .trim()
    .isLength({ min: 1, max: 150 })
    .withMessage('Assignment title is required and must be under 150 characters'),
  body('instructions').optional({ nullable: true }).isString().isLength({ max: 20000 }).withMessage('Instructions are too long'),
  body('dueDate').optional({ nullable: true }).isISO8601().withMessage('A valid due date is required'),
  body('points').optional().isInt({ min: 1, max: 100000 }).withMessage('Points must be a positive integer'),
  validate,
];