import { body } from 'express-validator';
import { validate } from './auth.validator.js';

export const lessonBodyValidation = [
  body('title')
    .optional()
    .trim()
    .isLength({ min: 1, max: 200 })
    .withMessage('Lesson title is required and must be under 200 characters'),
  body('content').optional().isString(),
  body('videoUrl').optional().isString().isLength({ max: 1000 }),
  body('durationMinutes').optional().isInt({ min: 0, max: 60000 }),
  validate,
];

export const createLessonValidation = [
  body('title')
    .trim()
    .notEmpty()
    .withMessage('Lesson title is required')
    .isLength({ max: 200 })
    .withMessage('Lesson title must be under 200 characters'),
  body('content').optional().isString(),
  body('videoUrl').optional().isString().isLength({ max: 1000 }),
  body('durationMinutes').optional().isInt({ min: 0, max: 60000 }),
  validate,
];

const RESOURCE_TYPES = ['PDF', 'DOC', 'DOCX', 'IMAGE', 'LINK', 'VIDEO', 'OTHER'];

export const createResourceValidation = [
  body('title').trim().notEmpty().withMessage('Resource title is required').isLength({ max: 150 }),
  body('type')
    .optional()
    .isIn(RESOURCE_TYPES)
    .withMessage('Resource type must be one of: PDF, DOC, DOCX, IMAGE, LINK, VIDEO, OTHER'),
  body('url').isString().notEmpty().withMessage('Resource URL is required').isLength({ max: 1000 }),
  body('size').optional().isInt({ min: 0 }),
  validate,
];