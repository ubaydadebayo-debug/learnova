import { Router } from 'express';
import { param, body } from 'express-validator';
import { authenticate } from '../middleware/authenticate.js';
import { loadAuthenticatedUser, requireStudent } from '../middleware/authorize.js';
import {
  listCertificatesController,
  getCertificateController,
  downloadCertificateController,
  verifyCertificateController,
  issueCertificateController,
  generateCertificatePreview,
  buildVerificationCodeForStudent,
} from '../controllers/certificate.controller.js';
import { validate } from '../validators/auth.validator.js';

const router = Router();

router.get('/verify/:verificationCode', [
  param('verificationCode').trim().isLength({ min: 1, max: 200 }),
  validate,
], verifyCertificateController);

router.use(authenticate, loadAuthenticatedUser);

router.get('/', requireStudent, listCertificatesController);
router.post('/issue', requireStudent, [
  body('courseId').isString().trim().notEmpty(),
  validate,
], issueCertificateController);
router.get('/preview/:courseId', requireStudent, generateCertificatePreview);
router.get('/verify/me/:courseId', requireStudent, buildVerificationCodeForStudent);
router.get('/:certificateId/download', requireStudent, [
  param('certificateId').isString().trim().isLength({ min: 1, max: 100 }),
  validate,
], downloadCertificateController);
router.get('/:certificateId', requireStudent, getCertificateController);

export default router;