import { prisma } from '../config/prisma.js';
import { ApiError } from '../utils/ApiError.js';
import { createNotification } from './notification.service.js';
import { NOTIFICATION_TYPES } from '../constants/index.js';

const assignmentSummary = {
  id: true,
  title: true,
  points: true,
  dueDate: true,
  module: { select: { id: true, title: true, course: { select: { id: true, title: true, instructorId: true } } } },
};

async function ownedAssignment(instructorId, assignmentId) {
  const assignment = await prisma.assignment.findFirst({
    where: { id: assignmentId, module: { course: { instructorId } } },
    select: assignmentSummary,
  });
  if (!assignment) throw ApiError.notFound('Assignment not found');
  return assignment;
}

export async function listInstructorAssignments(instructorId) {
  return prisma.assignment.findMany({
    where: { module: { course: { instructorId } } },
    orderBy: [{ dueDate: 'asc' }, { createdAt: 'desc' }],
    select: {
      ...assignmentSummary,
      _count: { select: { submissions: true } },
      submissions: { select: { status: true } },
    },
  });
}

export async function getInstructorAssignment(instructorId, assignmentId) {
  await ownedAssignment(instructorId, assignmentId);
  return prisma.assignment.findFirst({
    where: { id: assignmentId },
    select: {
      ...assignmentSummary,
      instructions: true,
      submissions: {
        orderBy: { submittedAt: 'desc' },
        select: {
          id: true,
          text: true,
          status: true,
          submittedAt: true,
          grade: true,
          feedback: true,
          gradedAt: true,
          student: { select: { id: true, firstName: true, lastName: true, email: true } },
        },
      },
    },
  });
}

export async function gradeSubmission(instructorId, submissionId, grade, feedback) {
  const submission = await prisma.submission.findFirst({
    where: { id: submissionId, assignment: { module: { course: { instructorId } } } },
    select: {
      id: true,
      studentId: true,
      assignment: {
        select: {
          points: true,
          title: true,
          module: { select: { course: { select: { title: true } } } },
        },
      },
    },
  });
  if (!submission) throw ApiError.notFound('Submission not found');
  if (grade > submission.assignment.points) throw ApiError.badRequest(`Grade cannot exceed ${submission.assignment.points} points`);

  const graded = await prisma.submission.update({
    where: { id: submissionId },
    data: {
      grade,
      feedback: feedback?.trim() || null,
      status: 'GRADED',
      gradedById: instructorId,
      gradedAt: new Date(),
    },
    select: { id: true, status: true, grade: true, feedback: true, gradedAt: true },
  });

  await createNotification({
    userId: submission.studentId,
    type: NOTIFICATION_TYPES.GRADING,
    title: 'Assignment graded',
    message: `Your submission for "${submission.assignment.title}" was graded: ${grade}/${submission.assignment.points} points.`,
    link: '/student/assignments',
  });

  return graded;
}