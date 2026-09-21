import { body, validationResult } from 'express-validator';
import { ApiError } from '../utils/ApiError.js';
import { ROLES } from '../constants/index.js';

export const validate = (req, _res, next) => {
  const errors = validationResult(req);
  if (errors.isEmpty()) {
    return next();
  }
  const firstError = errors.array()[0];
  const message = firstError.msg || 'Invalid input';
  next(ApiError.badRequest(message));
};

export const registerValidation = [
  body('firstName')
    .trim()
    .notEmpty()
    .withMessage('First name is required')
    .isLength({ min: 1, max: 50 })
    .withMessage('First name must be between 1 and 50 characters'),
  body('lastName')
    .trim()
    .notEmpty()
    .withMessage('Last name is required')
    .isLength({ min: 1, max: 50 })
    .withMessage('Last name must be between 1 and 50 characters'),
  body('email')
    .trim()
    .isEmail()
    .withMessage('A valid email is required')
    .isLength({ max: 255 })
    .withMessage('Email is too long')
    .normalizeEmail(),
  body('password')
    .isLength({ min: 8, max: 128 })
    .withMessage('Password must be at least 8 characters')
    .matches(/[a-zA-Z]/)
    .withMessage('Password must contain at least one letter')
    .matches(/\d/)
    .withMessage('Password must contain at least one number'),
  body('confirmPassword')
    .custom((value, { req }) => value === req.body.password)
    .withMessage('Passwords do not match'),
  body('role')
    .optional()
    .isIn([ROLES.STUDENT, ROLES.INSTRUCTOR])
    .withMessage('Role must be student or instructor'),
  validate,
];

export const loginValidation = [
  body('email').trim().isEmail().withMessage('A valid email is required').normalizeEmail(),
  body('password').notEmpty().withMessage('Password is required'),
  validate,
];