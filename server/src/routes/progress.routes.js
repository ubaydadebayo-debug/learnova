import { Router } from 'express';
import { authenticate } from '../middleware/authenticate.js';
import { loadAuthenticatedUser, requireStudent } from '../middleware/authorize.js';
import {
  completeLesson,
  uncompleteLesson,
  summary,
} from '../controllers/student.controller.js';
import { lessonIdParamValidation } from '../validators/enrollment.validator.js';

const router = Router();

router.use(authenticate, loadAuthenticatedUser, requireStudent);

router.get('/summary', summary);
router.post('/lessons/:lessonId/complete', lessonIdParamValidation, completeLesson);
router.post('/lessons/:lessonId/uncomplete', lessonIdParamValidation, uncompleteLesson);

export default router;