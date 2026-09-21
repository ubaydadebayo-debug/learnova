import { Router } from 'express';
import { authenticate } from '../middleware/authenticate.js';
import { loadAuthenticatedUser, requireStudent } from '../middleware/authorize.js';
import { aiLimiter } from '../middleware/rateLimiter.js';
import {
  listConversationsController,
  getConversationController,
  createConversationController,
  sendMessageController,
} from '../controllers/ai.controller.js';
import {
  aiConversationIdValidation,
  createConversationValidation,
  sendMessageValidation,
} from '../validators/ai.validator.js';

const router = Router();

router.use(authenticate, loadAuthenticatedUser, requireStudent);

router.get('/conversations', listConversationsController);
router.post('/conversations', aiLimiter, createConversationValidation, createConversationController);
router.get('/conversations/:conversationId', aiConversationIdValidation, getConversationController);
router.post('/conversations/:conversationId/messages', aiLimiter, sendMessageValidation, sendMessageController);

export default router;