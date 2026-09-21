import { body, param } from 'express-validator';
import { validate } from './auth.validator.js';

export const quizIdParamValidation = [
  param('quizId').isString().trim().isLength({ min: 1, max: 100 }),
  validate,
];

export const submitQuizValidation = [
  ...quizIdParamValidation,
  body('answers').isArray({ max: 100 }).withMessage('Answers must be an array'),
  body('answers.*.questionId').isString().trim().notEmpty().withMessage('Question id is required'),
  body('answers.*.optionId').optional({ nullable: true }).isString().trim().notEmpty(),
  validate,
];