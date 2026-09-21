import { Router } from 'express';
import { register, login, logout, me } from '../controllers/auth.controller.js';
import { registerValidation, loginValidation } from '../validators/auth.validator.js';
import { authenticate } from '../middleware/authenticate.js';
import { loadAuthenticatedUser } from '../middleware/authorize.js';
import { authLimiter } from '../middleware/rateLimiter.js';

const router = Router();

router.post('/register', authLimiter, registerValidation, register);
router.post('/login', authLimiter, loginValidation, login);
router.get('/me', authenticate, loadAuthenticatedUser, me);
router.post('/logout', authenticate, logout);

export default router;