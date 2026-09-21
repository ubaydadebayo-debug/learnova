import { Router } from 'express';
import { authenticate } from '../middleware/authenticate.js';
import { loadAuthenticatedUser } from '../middleware/authorize.js';
import { downloadSubmissionFileController } from '../controllers/assignment.controller.js';
import { submissionIdParamValidation } from '../validators/assignment.validator.js';

const router = Router();

router.use(authenticate, loadAuthenticatedUser);
router.get('/:submissionId/file', submissionIdParamValidation, downloadSubmissionFileController);

export default router;