import { Router } from 'express';
import { authenticate } from '../middleware/authenticate.js';
import { loadAuthenticatedUser, requireStudent } from '../middleware/authorize.js';
import { getQuizController, submitQuizController } from '../controllers/quiz.controller.js';
import { quizIdParamValidation, submitQuizValidation } from '../validators/quiz.validator.js';

const router = Router();

router.use(authenticate, loadAuthenticatedUser, requireStudent);
router.get('/:quizId', quizIdParamValidation, getQuizController);
router.post('/:quizId/attempts', submitQuizValidation, submitQuizController);

export default router;