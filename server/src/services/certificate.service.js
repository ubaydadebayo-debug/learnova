import crypto from 'node:crypto';
import PDFDocument from 'pdfkit';

import { prisma } from '../config/prisma.js';
import { env } from '../config/env.js';
import { ApiError } from '../utils/ApiError.js';
import { createNotification } from './notification.service.js';
import { NOTIFICATION_TYPES } from '../constants/index.js';

const APP_NAME = process.env.APP_NAME ?? 'Learnova';

export function buildVerificationCode(studentId, courseId) {
  const hash = crypto
    .createHash('sha256')
    .update(`${studentId}:${courseId}:${APP_NAME}`)
    .digest('hex')
    .slice(0, 18)
    .toUpperCase();

  return `CERT-${hash}`;
}

export function buildCertificateNumber() {
  const stamp = Date.now().toString(36).toUpperCase();
  const random = crypto.randomBytes(3).toString('hex').toUpperCase();
  return `CERT-${stamp}-${random}`;
}

const certificateWithDetails = {
  id: true,
  number: true,
  verificationCode: true,
  issuedAt: true,
  student: {
    select: { id: true, firstName: true, lastName: true, email: true },
  },
  course: {
    select: {
      id: true,
      title: true,
      slug: true,
      thumbnailUrl: true,
      instructor: { select: { id: true, firstName: true, lastName: true, title: true } },
    },
  },
};

async function ensureEnrolledAndCompleted(studentId, courseId) {
  const enrollment = await prisma.enrollment.findUnique({
    where: { studentId_courseId: { studentId, courseId } },
    select: { id: true, status: true, completedAt: true },
  });

  if (!enrollment || enrollment.status !== 'COMPLETED') {
    throw ApiError.badRequest('Certificates are only issued for completed courses');
  }

  return enrollment;
}

export async function issueCourseCertificate({ studentId, courseId }) {
  await ensureEnrolledAndCompleted(studentId, courseId);

  const existing = await prisma.certificate.findUnique({
    where: { studentId_courseId: { studentId, courseId } },
    select: { id: true },
  });

  const certificate = await prisma.certificate.upsert({
    where: { studentId_courseId: { studentId, courseId } },
    update: {},
    create: {
      studentId,
      courseId,
      number: buildCertificateNumber(),
      verificationCode: buildVerificationCode(studentId, courseId),
    },
    select: certificateWithDetails,
  });

  return { certificate, created: !existing };
}

export async function issueCertificateAndNotify(studentId, courseId) {
  const { certificate } = await issueCourseCertificate({ studentId, courseId });

  await createNotification({
    userId: studentId,
    type: NOTIFICATION_TYPES.CERTIFICATE,
    title: 'Certificate ready',
    message: `Your certificate for ${certificate.course.title} is ready.`,
    link: '/student/certificates',
  });

  return certificate;
}

export async function listCertificates(studentId) {
  return prisma.certificate.findMany({
    where: { studentId },
    orderBy: { issuedAt: 'desc' },
    select: {
      id: true,
      number: true,
      verificationCode: true,
      issuedAt: true,
      course: {
        select: { id: true, title: true, slug: true, thumbnailUrl: true },
      },
    },
  });
}

export async function getCertificateForStudent(studentId, certificateId) {
  const certificate = await prisma.certificate.findFirst({
    where: { id: certificateId, studentId },
    select: certificateWithDetails,
  });

  if (!certificate) {
    throw ApiError.notFound('Certificate not found');
  }

  return certificate;
}

export async function getCertificateByCode(verificationCode) {
  const certificate = await prisma.certificate.findUnique({
    where: { verificationCode },
    select: certificateWithDetails,
  });

  if (!certificate) {
    throw ApiError.notFound('Certificate not found');
  }

  return certificate;
}

export function generateCertificatePdf(certificate) {
  const doc = new PDFDocument({ size: 'A4', layout: 'landscape', margin: 0, bufferPages: true });
  const chunks = [];
  doc.on('data', (chunk) => chunks.push(chunk));

  const pageWidth = doc.page.width;
  const pageHeight = doc.page.height;
  const border = 24;

  const navy = '#0F172A';
  const blue = '#2563EB';
  const muted = '#64748B';

  // Outer frame
  doc.rect(border, border, pageWidth - border * 2, pageHeight - border * 2).lineWidth(2).stroke('#E2E8F0');

  // Inner frame accent
  doc
    .rect(border + 10, border + 10, pageWidth - (border + 10) * 2, pageHeight - (border + 10) * 2)
    .lineWidth(1)
    .stroke(blue);

  doc.fontSize(10).fillColor(blue).text('C E R T I F I C A T E   O F   C O M P L E T I O N', border + 30, border + 46, { align: 'center', width: pageWidth - (border + 30) * 2 });

  doc.moveDown(2);
  doc.fontSize(18).fillColor(navy).text(APP_NAME, { align: 'center' });

  doc.moveDown(3);
  doc.fontSize(34).fillColor(navy).text(certificate.student.firstName + ' ' + certificate.student.lastName, { align: 'center' });

  doc.moveDown(0.8);
  doc.fontSize(12).fillColor(muted).text('has successfully completed the course', { align: 'center' });

  doc.moveDown(1);
  doc.fontSize(22).fillColor(blue).text(certificate.course.title, { align: 'center' });

  doc.moveDown(0.8);
  doc
    .fontSize(11)
    .fillColor(muted)
    .text(
      `Taught by ${certificate.course.instructor.firstName} ${certificate.course.instructor.lastName} · ${new Date(certificate.issuedAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}`,
      { align: 'center' }
    );

  doc.moveDown(6);
  doc.fontSize(9).fillColor(muted).text(`Certificate No. ${certificate.number}`, border + 40, pageHeight - border - 60, { width: 260 });
  doc.fontSize(9).fillColor(muted).text(`Verification code: ${certificate.verificationCode}`, border + 40, pageHeight - border - 40, { width: 260 });
  doc.fontSize(9).fillColor(muted).text('Verify at ' + env.clientUrl + '/certificates/verify/' + certificate.verificationCode, { align: 'right', width: pageWidth - (border + 40) * 2, x: border + 40, y: pageHeight - border - 40 });

  doc.end();

  return new Promise((resolve, reject) => {
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);
  });
}