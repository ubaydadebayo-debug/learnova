import fs from 'node:fs';
import path from 'node:path';

import { prisma } from '../config/prisma.js';
import { ApiError } from '../utils/ApiError.js';
import { resolveUploadPath } from '../config/upload.js';
import { createNotification } from './notification.service.js';
import { NOTIFICATION_TYPES } from '../constants/index.js';

const assignmentSelect = {
  id: true,
  title: true,
  instructions: true,
  dueDate: true,
  points: true,
  position: true,
module: {
        select: {
          id: true,
          title: true,
          course: { select: { id: true, title: true, slug: true, instructorId: true } },
        },
      },
};

async function getAssignmentForStudent(studentId, assignmentId) {
  const assignment = await prisma.assignment.findFirst({
    where: {
      id: assignmentId,
      module: {
        course: {
          status: 'PUBLISHED',
          enrollments: { some: { studentId, status: { in: ['ACTIVE', 'COMPLETED'] } } },
        },
      },
    },
    select: {
      ...assignmentSelect,
      submissions: {
        where: { studentId },
        select: {
          id: true,
          text: true,
          fileUrl: true,
          fileName: true,
          fileSize: true,
          status: true,
          submittedAt: true,
          grade: true,
          feedback: true,
          gradedAt: true,
        },
      },
    },
  });

  if (!assignment) throw ApiError.notFound('Assignment not found');
  const { submissions, ...details } = assignment;
  return { ...details, submission: submissions[0] ?? null };
}

export async function listAssignments(studentId) {
  const assignments = await prisma.assignment.findMany({
    where: {
      module: {
        course: {
          status: 'PUBLISHED',
          enrollments: { some: { studentId, status: { in: ['ACTIVE', 'COMPLETED'] } } },
        },
      },
    },
    orderBy: [{ dueDate: 'asc' }, { createdAt: 'desc' }],
    select: {
      ...assignmentSelect,
      submissions: {
        where: { studentId },
        select: { id: true, status: true, submittedAt: true, grade: true, feedback: true },
      },
    },
  });

  return assignments.map(({ submissions, ...assignment }) => ({
    ...assignment,
    submission: submissions[0] ?? null,
  }));
}

export async function getAssignment(studentId, assignmentId) {
  return getAssignmentForStudent(studentId, assignmentId);
}

export async function submitAssignment(studentId, assignmentId, { text, file }) {
  if (text === undefined && !file) {
    throw ApiError.badRequest('Submit text, a file, or both');
  }
  const assignment = await getAssignmentForStudent(studentId, assignmentId);
  if (assignment.submission?.status === 'GRADED') {
    throw ApiError.conflict('A graded assignment cannot be resubmitted');
  }

  const submittedAt = new Date();
  const data = {
    status: 'SUBMITTED',
    submittedAt,
    grade: null,
    feedback: null,
    gradedById: null,
    gradedAt: null,
  };
  if (text !== undefined) data.text = text;
  if (file) {
    data.fileUrl = file.fileUrl;
    data.fileName = file.fileName;
    data.fileSize = file.fileSize;
  }

  const existingSubmission = await prisma.submission.findUnique({
    where: { assignmentId_studentId: { assignmentId, studentId } },
    select: { fileUrl: true },
  });

  const submission = await prisma.submission.upsert({
    where: { assignmentId_studentId: { assignmentId, studentId } },
    update: data,
    create: {
      assignmentId,
      studentId,
      text: text ?? null,
      fileUrl: file?.fileUrl ?? null,
      fileName: file?.fileName ?? null,
      fileSize: file?.fileSize ?? null,
      status: 'SUBMITTED',
      submittedAt,
    },
    select: {
      id: true,
      assignmentId: true,
      text: true,
      fileUrl: true,
      fileName: true,
      fileSize: true,
      status: true,
      submittedAt: true,
      grade: true,
      feedback: true,
    },
  });

  // Remove the previous file from disk when a resubmission replaces it.
  if (file && existingSubmission?.fileUrl && existingSubmission.fileUrl !== submission.fileUrl) {
    try {
      const previousFile = resolveUploadPath(existingSubmission.fileUrl);
      if (fs.existsSync(previousFile)) fs.unlink(previousFile, () => {});
    } catch {
      // Never let orphan cleanup block a successful submission.
    }
  }

  const student = await prisma.user.findUnique({
    where: { id: studentId },
    select: { firstName: true, lastName: true },
  });

  await createNotification({
    userId: assignment.module.course.instructorId,
    type: NOTIFICATION_TYPES.SUBMISSION,
    title: 'New submission',
    message: `${student?.firstName ?? 'A student'} ${student?.lastName ?? ''} submitted "${assignment.title}" in ${assignment.module.course.title}.`.replace(/\s+/g, ' ').trim(),
    link: `/instructor/assignments/${assignmentId}`,
  });

  return { submission };
}

export async function downloadSubmissionFile(user, submissionId, res) {
  const submission = await prisma.submission.findUnique({
    where: { id: submissionId },
    select: {
      id: true,
      studentId: true,
      fileUrl: true,
      fileName: true,
      assignment: {
        select: {
          module: { select: { course: { select: { instructorId: true } } } },
        },
      },
    },
  });

  if (!submission?.fileUrl) throw ApiError.notFound('No file attached to this submission');

  const canAccess =
    submission.studentId === user.id ||
    submission.assignment.module.course.instructorId === user.id ||
    user.role === 'ADMIN';
  if (!canAccess) throw ApiError.forbidden('You do not have permission to access this file');

  const filePath = resolveUploadPath(submission.fileUrl);
  if (!fs.existsSync(filePath)) throw ApiError.notFound('The submitted file is no longer available');

  return new Promise((resolve, reject) => {
    res.download(filePath, submission.fileName || path.basename(filePath), (err) => {
      if (err) return reject(err);
      resolve();
    });
  });
}

const toIsoDateTime = (value) => {
  if (value === null || value === undefined || value === '') return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toISOString();
};

export async function createAssignment(moduleId, data) {
  const last = await prisma.assignment.findFirst({
    where: { moduleId },
    orderBy: { position: 'desc' },
    select: { position: true },
  });
  const position = (last?.position ?? -1) + 1;

  return prisma.assignment.create({
    data: {
      moduleId,
      title: data.title,
      instructions: data.instructions ?? '',
      dueDate: toIsoDateTime(data.dueDate),
      points: data.points ?? 100,
      position,
    },
    select: {
      id: true, moduleId: true, title: true, instructions: true,
      dueDate: true, points: true, position: true,
    },
  });
}

export async function updateAssignment(assignmentId, data) {
  const patch = {};
  if (data.title !== undefined) patch.title = data.title;
  if (data.instructions !== undefined) patch.instructions = data.instructions ?? '';
  if (data.points !== undefined) patch.points = data.points;
  if (data.dueDate !== undefined) patch.dueDate = toIsoDateTime(data.dueDate);

  return prisma.assignment.update({
    where: { id: assignmentId },
    data: patch,
    select: {
      id: true, moduleId: true, title: true, instructions: true,
      dueDate: true, points: true, position: true,
    },
  });
}

export async function deleteAssignment(assignmentId) {
  await prisma.assignment.delete({ where: { id: assignmentId } });
}