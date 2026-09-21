import { body } from 'express-validator';
import { validate } from './auth.validator.js';

export const moduleBodyValidation = [
  body('title')
    .optional()
    .trim()
    .isLength({ min: 1, max: 150 })
    .withMessage('Module title is required and must be under 150 characters'),
  body('description').optional().isString().isLength({ max: 1000 }),
  validate,
];

export const createModuleValidation = [
  body('title')
    .trim()
    .notEmpty()
    .withMessage('Module title is required')
    .isLength({ max: 150 })
    .withMessage('Module title must be under 150 characters'),
  body('description').optional().isString().isLength({ max: 1000 }),
  validate,
];

export const reorderValidation = [
  body('order')
    .isArray({ min: 1 })
    .withMessage('Order must be a non-empty array of ids'),
  body('order.*').isString().withMessage('Order entries must be valid ids'),
  validate,
];