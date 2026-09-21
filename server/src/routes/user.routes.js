import { Router } from 'express';
import { body } from 'express-validator';
import { authenticate } from '../middleware/authenticate.js';
import { loadAuthenticatedUser } from '../middleware/authorize.js';
import { validate } from '../validators/auth.validator.js';
import {
	getProfile,
	updateProfile,
	changePassword,
	updatePreferences,
} from '../controllers/user.controller.js';

const router = Router();

router.use(authenticate, loadAuthenticatedUser);

const profileValidation = [
	body('firstName').trim().notEmpty().isLength({ max: 50 }),
	body('lastName').trim().notEmpty().isLength({ max: 50 }),
	body('title').optional({ nullable: true }).trim().isLength({ max: 120 }),
	body('bio').optional({ nullable: true }).trim().isLength({ max: 2000 }),
	validate,
];

router.get('/profile', getProfile);
router.patch('/profile', profileValidation, updateProfile);
router.patch('/password', [
	body('currentPassword').notEmpty(),
	body('newPassword').isLength({ min: 8, max: 128 }).matches(/[a-zA-Z]/).matches(/\d/),
	validate,
], changePassword);
router.patch('/preferences', [
	body('language').isLength({ min: 2, max: 10 }),
	body('timezone').isLength({ min: 1, max: 100 }),
	body('emailNotifications').isBoolean().toBoolean(),
	body('pushNotifications').isBoolean().toBoolean(),
	validate,
], updatePreferences);

export default router;