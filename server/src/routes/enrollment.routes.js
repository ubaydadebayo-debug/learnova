import { Router } from 'express';
import { authenticate } from '../middleware/authenticate.js';
import { loadAuthenticatedUser, requireStudent } from '../middleware/authorize.js';
import {
  enroll,
  listMy,
  getByCourse,
  cancel,
} from '../controllers/student.controller.js';
import {
  createEnrollmentValidation,
  courseIdParamValidation,
} from '../validators/enrollment.validator.js';

const router = Router();

router.use(authenticate, loadAuthenticatedUser, requireStudent);

router.post('/', createEnrollmentValidation, enroll);
router.get('/', listMy);
router.get('/:courseId', courseIdParamValidation, getByCourse);
router.delete('/:courseId', courseIdParamValidation, cancel);

export default router;