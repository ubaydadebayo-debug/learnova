import { body, param } from 'express-validator';
import { validate } from './auth.validator.js';

export const createCategoryValidation = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Category name is required')
    .isLength({ max: 80 })
    .withMessage('Category name must be under 80 characters'),
  body('slug')
    .optional()
    .trim()
    .isLength({ max: 80 })
    .matches(/^[a-z0-9-]+$/)
    .withMessage('Slug may only contain lowercase letters, numbers and dashes'),
  body('description').optional().isString().isLength({ max: 500 }),
  body('icon').optional().isString().isLength({ max: 30 }),
  validate,
];

export const updateCategoryValidation = [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 1, max: 80 })
    .withMessage('Category name must be under 80 characters'),
  body('slug')
    .optional()
    .trim()
    .isLength({ max: 80 })
    .matches(/^[a-z0-9-]+$/)
    .withMessage('Slug may only contain lowercase letters, numbers and dashes'),
  body('description').optional().isString().isLength({ max: 500 }),
  body('icon').optional().isString().isLength({ max: 30 }),
  validate,
];

export const idParamValidation = [
  param('id').isString().trim().isLength({ min: 1, max: 100 }),
  validate,
];

export const paramValidation = (name) => [
  param(name).isString().trim().isLength({ min: 1, max: 100 }),
  validate,
];