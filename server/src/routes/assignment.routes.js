import { Router } from 'express';
import { authenticate } from '../middleware/authenticate.js';
import { loadAuthenticatedUser, requireStudent } from '../middleware/authorize.js';
import {
	getAssignmentController,
	listAssignmentsController,
	submitAssignmentController,
} from '../controllers/assignment.controller.js';
import {
	assignmentIdParamValidation,
	submitAssignmentValidation,
} from '../validators/assignment.validator.js';
import { uploadAssignmentFileMiddleware } from '../config/upload.js';

const router = Router();

router.use(authenticate, loadAuthenticatedUser, requireStudent);
router.get('/', listAssignmentsController);
router.get('/:assignmentId', assignmentIdParamValidation, getAssignmentController);
router.post('/:assignmentId/submissions', uploadAssignmentFileMiddleware, submitAssignmentValidation, submitAssignmentController);

export default router;