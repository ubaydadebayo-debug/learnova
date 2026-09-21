import { query, param, body } from 'express-validator';
import { validate } from './auth.validator.js';

const LEVELS = ['BEGINNER', 'INTERMEDIATE', 'ADVANCED'];
const SORTS = ['popular', 'newest', 'rating', 'title'];
const COURSE_STATUSES = ['DRAFT', 'PUBLISHED', 'ARCHIVED'];

const titleChain = () =>
  body('title')
    .optional()
    .trim()
    .isLength({ min: 1, max: 200 })
    .withMessage('Title is required and must be under 200 characters');

export const createCourseValidation = [
  body('title')
    .trim()
    .notEmpty()
    .withMessage('Course title is required')
    .isLength({ max: 200 })
    .withMessage('Title must be under 200 characters'),
  body('categoryId').isString().notEmpty().withMessage('Category is required'),
  body('level')
    .optional()
    .isIn(LEVELS)
    .withMessage('Level must be beginner, intermediate or advanced'),
  body('shortDescription').optional().isString().isLength({ max: 300 }),
  body('description').optional().isString().isLength({ max: 8000 }),
  body('durationMinutes').optional().isInt({ min: 0, max: 60000 }),
  body('outcomes').optional().isArray({ max: 20 }),
  body('outcomes.*').optional().isString().isLength({ max: 200 }),
  body('thumbnailUrl').optional().isString().isLength({ max: 600 }),
  validate,
];

const courseOptionalChains = [
  titleChain(),
  body('categoryId').optional().isString().notEmpty(),
  body('level').optional().isIn(LEVELS).withMessage('Level must be beginner, intermediate or advanced'),
  body('shortDescription').optional().isString().isLength({ max: 300 }),
  body('description').optional().isString().isLength({ max: 8000 }),
  body('durationMinutes').optional().isInt({ min: 0, max: 60000 }),
  body('outcomes').optional().isArray({ max: 20 }),
  body('outcomes.*').optional().isString().isLength({ max: 200 }),
  body('thumbnailUrl').optional().isString().isLength({ max: 600 }),
];

export const updateCourseValidation = [...courseOptionalChains, validate];

export const adminUpdateCourseValidation = [
  ...courseOptionalChains,
  body('status').optional().isIn(COURSE_STATUSES).withMessage('Status must be draft, published or archived'),
  validate,
];

export const courseStatusUpdateValidation = [
  body('status')
    .optional()
    .isIn(COURSE_STATUSES)
    .withMessage('Status must be draft, published or archived'),
  validate,
];

export const listCoursesValidation = [
  query('search').optional().isString().trim().isLength({ min: 1, max: 120 }),
  query('category').optional().isString().trim().isLength({ max: 100 }),
  query('level').optional().isIn(LEVELS).withMessage('Level must be beginner, intermediate or advanced'),
  query('instructor').optional().isString().trim().isLength({ max: 100 }),
  query('minRating').optional().isFloat({ min: 0, max: 5 }).withMessage('Rating must be between 0 and 5'),
  query('minDuration').optional().isInt({ min: 0 }).withMessage('Min duration must be a positive integer'),
  query('maxDuration').optional().isInt({ min: 1 }).withMessage('Max duration must be a positive integer'),
  query('sort').optional().isIn(SORTS).withMessage('Invalid sort option'),
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 24 }).withMessage('Limit must be between 1 and 24'),
  validate,
];

export const courseIdentifierValidation = [
  param('id').isString().trim().isLength({ min: 1, max: 200 }),
  validate,
];

export const adminListCoursesValidation = [
  query('search').optional().isString().trim().isLength({ min: 1, max: 120 }),
  query('status').optional().isIn(COURSE_STATUSES).withMessage('Invalid course status'),
  query('instructor').optional().isString().trim().isLength({ max: 100 }),
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 50 }).withMessage('Limit must be between 1 and 50'),
  validate,
];