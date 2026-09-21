import { asyncHandler } from '../utils/asyncHandler.js';
import { sendSuccess } from '../utils/ApiResponse.js';
import {
  listCertificates,
  getCertificateForStudent,
  getCertificateByCode,
  issueCourseCertificate,
  generateCertificatePdf,
  buildVerificationCode,
  buildCertificateNumber,
} from '../services/certificate.service.js';

export const listCertificatesController = asyncHandler(async (req, res) => {
  const certificates = await listCertificates(req.user.id);
  sendSuccess(res, 200, 'Certificates retrieved successfully', { certificates });
});

export const getCertificateController = asyncHandler(async (req, res) => {
  const certificate = await getCertificateForStudent(req.user.id, req.params.certificateId);
  sendSuccess(res, 200, 'Certificate retrieved successfully', { certificate });
});

export const downloadCertificateController = asyncHandler(async (req, res) => {
  const certificate = await getCertificateForStudent(req.user.id, req.params.certificateId);
  const pdf = await generateCertificatePdf(certificate);

  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename="learnova-certificate-${certificate.number.toLowerCase().replace(/[^a-z0-9]/gi, '-')}.pdf"`);
  res.setHeader('Content-Length', pdf.length);
  res.send(pdf);
});

export const verifyCertificateController = asyncHandler(async (req, res) => {
  const certificate = await getCertificateByCode(req.params.verificationCode);
  sendSuccess(res, 200, 'Certificate verified successfully', { certificate });
});

export const issueCertificateController = asyncHandler(async (req, res) => {
  const result = await issueCourseCertificate({
    studentId: req.user.id,
    courseId: req.body.courseId,
  });
  sendSuccess(res, result.created ? 201 : 200, 'Certificate issued successfully', { certificate: result.certificate });
});

export const generateCertificatePreview = asyncHandler(async (req, res) => {
  const preview = {
    studentId: req.user.id,
    courseId: req.params.courseId,
    number: buildCertificateNumber(),
    verificationCode: buildVerificationCode(req.user.id, req.params.courseId),
  };
  sendSuccess(res, 200, 'Certificate preview generated successfully', { preview });
});

export const buildVerificationCodeForStudent = asyncHandler(async (req, res) => {
  const code = buildVerificationCode(req.user.id, req.params.courseId);
  sendSuccess(res, 200, 'Verification code generated successfully', { verificationCode: code });
});