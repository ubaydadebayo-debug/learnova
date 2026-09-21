import { body, param, query } from 'express-validator';
import { validate } from './auth.validator.js';

const ROLES = ['STUDENT', 'INSTRUCTOR', 'ADMIN'];
const STATUSES = ['ACTIVE', 'PENDING', 'SUSPENDED'];

export const adminListUsersValidation = [
  query('search').optional().isString().trim().isLength({ min: 1, max: 120 }),
  query('role').optional().isIn(ROLES).withMessage('Invalid user role'),
  query('status').optional().isIn(STATUSES).withMessage('Invalid account status'),
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 50 }).withMessage('Limit must be between 1 and 50'),
  validate,
];

export const userIdParamValidation = [
  param('id').isString().trim().isLength({ min: 1, max: 100 }),
  validate,
];

export const updateUserStatusValidation = [
  ...userIdParamValidation,
  body('status').isIn(STATUSES).withMessage('Invalid account status'),
  validate,
];