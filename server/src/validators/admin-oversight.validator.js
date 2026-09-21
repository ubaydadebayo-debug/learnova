import { query, param, body } from 'express-validator';
import { validate } from './auth.validator.js';

const ENROLLMENT_STATUSES = ['ACTIVE', 'COMPLETED', 'CANCELLED'];

export const adminListEnrollmentsValidation = [
  query('search').optional().isString().trim().isLength({ min: 1, max: 120 }),
  query('status').optional().isIn(ENROLLMENT_STATUSES).withMessage('Invalid enrollment status'),
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 50 }).withMessage('Limit must be between 1 and 50'),
  validate,
];

export const adminEnrollmentStatusUpdateValidation = [
  param('id').isString().trim().isLength({ min: 1, max: 100 }),
  body('status').isIn(ENROLLMENT_STATUSES).withMessage('Status must be active, completed or cancelled'),
  validate,
];

export const adminListCertificatesValidation = [
  query('search').optional().isString().trim().isLength({ min: 1, max: 120 }),
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 50 }).withMessage('Limit must be between 1 and 50'),
  validate,
];

export const adminListQuizzesValidation = [
  query('search').optional().isString().trim().isLength({ min: 1, max: 120 }),
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 50 }).withMessage('Limit must be between 1 and 50'),
  validate,
];

export const adminListAssignmentsValidation = [
  query('search').optional().isString().trim().isLength({ min: 1, max: 120 }),
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 50 }).withMessage('Limit must be between 1 and 50'),
  validate,
];

export const adminActivityValidation = [
  query('limit').optional().isInt({ min: 1, max: 20 }).withMessage('Limit must be between 1 and 20'),
  validate,
];