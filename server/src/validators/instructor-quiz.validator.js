import { body, param } from 'express-validator';
import { validate } from './auth.validator.js';

export const quizIdParamValidation = [
  param('quizId').isString().trim().isLength({ min: 1, max: 100 }),
  validate,
];

export const questionIdParamValidation = [
  param('questionId').isString().trim().isLength({ min: 1, max: 100 }),
  validate,
];

export const createQuizValidation = [
  body('title')
    .trim()
    .notEmpty()
    .withMessage('Quiz title is required')
    .isLength({ max: 150 })
    .withMessage('Quiz title must be under 150 characters'),
  body('description').optional({ nullable: true }).isString().isLength({ max: 2000 }),
  body('passingScore')
    .optional()
    .isInt({ min: 0, max: 100 })
    .withMessage('Passing score must be a percentage between 0 and 100'),
  body('timeLimitMinutes')
    .optional({ nullable: true })
    .isInt({ min: 1, max: 600 })
    .withMessage('Time limit must be between 1 and 600 minutes'),
  body('maxAttempts')
    .optional({ nullable: true })
    .isInt({ min: 1, max: 100 })
    .withMessage('Max attempts must be between 1 and 100'),
  body('allowRetake').optional().isBoolean().withMessage('allowRetake must be a boolean'),
  validate,
];

export const quizBodyValidation = [
  body('title')
    .optional()
    .trim()
    .isLength({ min: 1, max: 150 })
    .withMessage('Quiz title is required and must be under 150 characters'),
  body('description').optional({ nullable: true }).isString().isLength({ max: 2000 }),
  body('passingScore')
    .optional()
    .isInt({ min: 0, max: 100 })
    .withMessage('Passing score must be a percentage between 0 and 100'),
  body('timeLimitMinutes')
    .optional({ nullable: true })
    .isInt({ min: 1, max: 600 })
    .withMessage('Time limit must be between 1 and 600 minutes'),
  body('maxAttempts')
    .optional({ nullable: true })
    .isInt({ min: 1, max: 100 })
    .withMessage('Max attempts must be between 1 and 100'),
  body('allowRetake').optional().isBoolean().withMessage('allowRetake must be a boolean'),
  validate,
];

const validateQuestionOptions = (options) => {
  if (!Array.isArray(options) || options.length < 2) {
    throw new Error('Add at least two options and mark one correct');
  }
  options.forEach((option, index) => {
    if (!option || typeof option.text !== 'string' || !option.text.trim()) {
      throw new Error(`Option ${index + 1} text is required`);
    }
  });
  if (options.length > 10) {
    throw new Error('A question can have at most 10 options');
  }
  return true;
};

export const questionBodyValidation = [
  ...questionIdParamValidation,
  body('type').optional().isIn(['MULTIPLE_CHOICE', 'TRUE_FALSE']).withMessage('Question type is invalid'),
  body('prompt')
    .optional()
    .trim()
    .isLength({ min: 1, max: 1000 })
    .withMessage('Question prompt must be non-empty and under 1000 characters'),
  body('explanation').optional({ nullable: true }).isString().isLength({ max: 2000 }),
  body('points').optional().isInt({ min: 0, max: 100 }).withMessage('Points must be between 0 and 100'),
  body('options').optional().custom(validateQuestionOptions),
  validate,
];

export const createQuestionValidation = [
  body('type').isIn(['MULTIPLE_CHOICE', 'TRUE_FALSE']).withMessage('Question type is invalid'),
  body('prompt')
    .trim()
    .notEmpty()
    .withMessage('Question prompt is required')
    .isLength({ max: 1000 })
    .withMessage('Question prompt must be under 1000 characters'),
  body('explanation').optional({ nullable: true }).isString().isLength({ max: 2000 }),
  body('points').optional().isInt({ min: 0, max: 100 }).withMessage('Points must be between 0 and 100'),
  body('options').custom(validateQuestionOptions),
  validate,
];