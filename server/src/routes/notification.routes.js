import { Router } from 'express';
import { authenticate } from '../middleware/authenticate.js';
import { loadAuthenticatedUser } from '../middleware/authorize.js';
import { userHighFrequencyLimiter } from '../middleware/rateLimiter.js';
import { paramValidation } from '../validators/category.validator.js';
import {
  listNotificationsController,
  markNotificationReadController,
  markAllNotificationsReadController,
  unreadCountController,
} from '../controllers/notification.controller.js';

const router = Router();

router.use(authenticate, loadAuthenticatedUser);

router.get('/', listNotificationsController);
router.get('/unread-count', userHighFrequencyLimiter, unreadCountController);
router.patch('/read-all', markAllNotificationsReadController);
router.patch('/:notificationId/read', paramValidation('notificationId'), markNotificationReadController);

export default router;