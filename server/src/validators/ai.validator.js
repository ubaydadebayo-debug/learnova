import { body, param } from 'express-validator';
import { validate } from './auth.validator.js';

export const aiConversationIdValidation = [
  param('conversationId').isString().trim().isLength({ min: 1, max: 100 }),
  validate,
];

export const createConversationValidation = [
  body('title').optional().trim().isLength({ min: 1, max: 120 }).withMessage('Title must be between 1 and 120 characters'),
  body('courseId').optional().trim().isLength({ min: 1, max: 100 }).withMessage('Course ID is invalid'),
  body('lessonId').optional().trim().isLength({ min: 1, max: 100 }).withMessage('Lesson ID is invalid'),
  validate,
];

export const sendMessageValidation = [
  ...aiConversationIdValidation,
  body('message').trim().notEmpty().withMessage('Message is required').isLength({ min: 1, max: 4000 }).withMessage('Message must be less than 4000 characters'),
  validate,
];
