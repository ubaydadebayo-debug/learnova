import { prisma } from '../config/prisma.js';
import { ApiError } from '../utils/ApiError.js';

const ENROLLMENT_STATUSES = ['ACTIVE', 'COMPLETED', 'CANCELLED'];

export async function listAdminEnrollments({ search, status, page = 1, limit = 20 }) {
  const where = {};
  if (status) where.status = status;
  if (search) {
    where.OR = [
      { student: { firstName: { contains: search, mode: 'insensitive' } } },
      { student: { lastName: { contains: search, mode: 'insensitive' } } },
      { student: { email: { contains: search, mode: 'insensitive' } } },
      { course: { title: { contains: search, mode: 'insensitive' } } },
    ];
  }

  const safePage = Math.max(1, page);
  const safeLimit = Math.min(50, Math.max(1, limit));
  const [enrollments, total] = await Promise.all([
    prisma.enrollment.findMany({
      where,
      select: {
        id: true,
        status: true,
        enrolledAt: true,
        completedAt: true,
        student: { select: { id: true, firstName: true, lastName: true, email: true } },
        course: {
          select: {
            id: true,
            title: true,
            slug: true,
            instructor: { select: { id: true, firstName: true, lastName: true } },
          },
        },
      },
      orderBy: { enrolledAt: 'desc' },
      skip: (safePage - 1) * safeLimit,
      take: safeLimit,
    }),
    prisma.enrollment.count({ where }),
  ]);

  return {
    enrollments,
    pagination: { page: safePage, limit: safeLimit, total, totalPages: Math.ceil(total / safeLimit) },
  };
}

export async function updateEnrollmentStatus(enrollmentId, status) {
  if (!ENROLLMENT_STATUSES.includes(status)) {
    throw ApiError.badRequest('Status must be active, completed or cancelled');
  }

  const existing = await prisma.enrollment.findUnique({
    where: { id: enrollmentId },
    select: { id: true },
  });
  if (!existing) throw ApiError.notFound('Enrollment not found');

  const data = status === 'CANCELLED' ? { status, completedAt: null } : { status };
  return prisma.enrollment.update({
    where: { id: enrollmentId },
    data,
    select: { id: true, status: true },
  });
}

export async function listAdminCertificates({ search, page = 1, limit = 20 }) {
  const where = {};
  if (search) {
    where.OR = [
      { number: { contains: search, mode: 'insensitive' } },
      { verificationCode: { contains: search, mode: 'insensitive' } },
      { student: { firstName: { contains: search, mode: 'insensitive' } } },
      { student: { lastName: { contains: search, mode: 'insensitive' } } },
      { student: { email: { contains: search, mode: 'insensitive' } } },
      { course: { title: { contains: search, mode: 'insensitive' } } },
    ];
  }

  const safePage = Math.max(1, page);
  const safeLimit = Math.min(50, Math.max(1, limit));
  const [certificates, total] = await Promise.all([
    prisma.certificate.findMany({
      where,
      select: {
        id: true,
        number: true,
        verificationCode: true,
        issuedAt: true,
        student: { select: { id: true, firstName: true, lastName: true, email: true } },
        course: { select: { id: true, title: true, slug: true } },
      },
      orderBy: { issuedAt: 'desc' },
      skip: (safePage - 1) * safeLimit,
      take: safeLimit,
    }),
    prisma.certificate.count({ where }),
  ]);

  return {
    certificates,
    pagination: { page: safePage, limit: safeLimit, total, totalPages: Math.ceil(total / safeLimit) },
  };
}

export async function listAdminQuizzes({ search, page = 1, limit = 20 }) {
  const where = {};
  if (search) {
    where.OR = [
      { title: { contains: search, mode: 'insensitive' } },
      { description: { contains: search, mode: 'insensitive' } },
      { module: { title: { contains: search, mode: 'insensitive' } } },
      { module: { course: { title: { contains: search, mode: 'insensitive' } } } },
      {
        module: {
          course: {
            instructor: {
              OR: [
                { firstName: { contains: search, mode: 'insensitive' } },
                { lastName: { contains: search, mode: 'insensitive' } },
                { email: { contains: search, mode: 'insensitive' } },
              ],
            },
          },
        },
      },
    ];
  }

  const safePage = Math.max(1, page);
  const safeLimit = Math.min(50, Math.max(1, limit));

  const [quizzes, total, attemptGroups] = await Promise.all([
    prisma.quiz.findMany({
      where,
      select: {
        id: true,
        title: true,
        description: true,
        passingScore: true,
        allowRetake: true,
        publishedAt: true,
        createdAt: true,
        module: {
          select: {
            id: true,
            title: true,
            course: {
              select: {
                id: true,
                title: true,
                slug: true,
                instructor: { select: { id: true, firstName: true, lastName: true, email: true } },
              },
            },
          },
        },
        _count: { select: { questions: true } },
      },
      orderBy: { updatedAt: 'desc' },
      skip: (safePage - 1) * safeLimit,
      take: safeLimit,
    }),
    prisma.quiz.count({ where }),
    prisma.quizAttempt.groupBy({
      by: ['quizId'],
      _count: { _all: true },
      _avg: { percentage: true },
      where: { submittedAt: { not: null } },
    }),
  ]);

  const attemptsByQuiz = {};
  for (const group of attemptGroups) {
    attemptsByQuiz[group.quizId] = {
      attempts: group._count._all,
      averagePercentage: group._avg.percentage !== null ? Math.round(group._avg.percentage) : null,
    };
  }

  return {
    quizzes: quizzes.map((quiz) => ({
      ...quiz,
      questions: quiz._count.questions,
      attempts: attemptsByQuiz[quiz.id]?.attempts ?? 0,
      averagePercentage: attemptsByQuiz[quiz.id]?.averagePercentage ?? null,
    })),
    pagination: { page: safePage, limit: safeLimit, total, totalPages: Math.ceil(total / safeLimit) },
  };
}

export async function listAdminAssignments({ search, page = 1, limit = 20 }) {
  const where = {};
  if (search) {
    where.OR = [
      { title: { contains: search, mode: 'insensitive' } },
      { module: { title: { contains: search, mode: 'insensitive' } } },
      { module: { course: { title: { contains: search, mode: 'insensitive' } } } },
      {
        module: {
          course: {
            instructor: {
              OR: [
                { firstName: { contains: search, mode: 'insensitive' } },
                { lastName: { contains: search, mode: 'insensitive' } },
                { email: { contains: search, mode: 'insensitive' } },
              ],
            },
          },
        },
      },
    ];
  }

  const safePage = Math.max(1, page);
  const safeLimit = Math.min(50, Math.max(1, limit));

  const [assignments, total, submissionGroups] = await Promise.all([
    prisma.assignment.findMany({
      where,
      select: {
        id: true,
        title: true,
        points: true,
        dueDate: true,
        publishedAt: true,
        createdAt: true,
        module: {
          select: {
            id: true,
            title: true,
            course: {
              select: {
                id: true,
                title: true,
                slug: true,
                instructor: { select: { id: true, firstName: true, lastName: true, email: true } },
              },
            },
          },
        },
      },
      orderBy: { updatedAt: 'desc' },
      skip: (safePage - 1) * safeLimit,
      take: safeLimit,
    }),
    prisma.assignment.count({ where }),
    prisma.submission.groupBy({
      by: ['assignmentId', 'status'],
      _count: { _all: true },
      _avg: { grade: true },
    }),
  ]);

  const byStatusByAssignment = {};
  const averageGradeByAssignment = {};
  for (const group of submissionGroups) {
    if (!byStatusByAssignment[group.assignmentId]) {
      byStatusByAssignment[group.assignmentId] = { PENDING: 0, SUBMITTED: 0, GRADED: 0, LATE: 0 };
    }
    byStatusByAssignment[group.assignmentId][group.status] = group._count._all;
    if (group.status === 'GRADED') {
      averageGradeByAssignment[group.assignmentId] =
        group._avg.grade !== null && group._avg.grade !== undefined ? Math.round(group._avg.grade) : null;
    }
  }

  return {
    assignments: assignments.map((assignment) => {
      const byStatus = byStatusByAssignment[assignment.id] ?? { PENDING: 0, SUBMITTED: 0, GRADED: 0, LATE: 0 };
      return {
        ...assignment,
        submissions: byStatus.PENDING + byStatus.SUBMITTED + byStatus.GRADED + byStatus.LATE,
        pending: byStatus.PENDING + byStatus.SUBMITTED + byStatus.LATE,
        graded: byStatus.GRADED,
        averageGrade: averageGradeByAssignment[assignment.id] ?? null,
      };
    }),
    pagination: { page: safePage, limit: safeLimit, total, totalPages: Math.ceil(total / safeLimit) },
  };
}

export async function getRecentActivity({ limit = 10 }) {
  const safeLimit = Math.min(20, Math.max(1, limit));
  const [registrations, enrollments, publications, certificates, gradings] = await Promise.all([
    prisma.user.findMany({
      select: { id: true, firstName: true, lastName: true, email: true, createdAt: true },
      orderBy: { createdAt: 'desc' },
      take: safeLimit,
    }),
    prisma.enrollment.findMany({
      select: {
        id: true,
        enrolledAt: true,
        student: { select: { firstName: true, lastName: true } },
        course: { select: { title: true } },
      },
      orderBy: { enrolledAt: 'desc' },
      take: safeLimit,
    }),
    prisma.course.findMany({
      where: { publishedAt: { not: null } },
      select: { id: true, title: true, publishedAt: true, instructor: { select: { firstName: true, lastName: true } } },
      orderBy: { publishedAt: 'desc' },
      take: safeLimit,
    }),
    prisma.certificate.findMany({
      select: {
        id: true,
        issuedAt: true,
        student: { select: { firstName: true, lastName: true } },
        course: { select: { title: true } },
      },
      orderBy: { issuedAt: 'desc' },
      take: safeLimit,
    }),
    prisma.submission.findMany({
      where: { gradedAt: { not: null } },
      select: {
        id: true,
        gradedAt: true,
        student: { select: { firstName: true, lastName: true } },
        assignment: { select: { title: true } },
      },
      orderBy: { gradedAt: 'desc' },
      take: safeLimit,
    }),
  ]);

  const events = [
    ...registrations.map((r) => ({
      type: 'registration',
      label: `${r.firstName} ${r.lastName} joined the platform`,
      detail: r.email,
      at: r.createdAt,
    })),
    ...enrollments.map((e) => ({
      type: 'enrollment',
      label: `${e.student.firstName} ${e.student.lastName} enrolled in “${e.course.title}”`,
      detail: 'New enrollment',
      at: e.enrolledAt,
    })),
    ...publications.map((c) => ({
      type: 'publication',
      label: `“${c.title}” was published`,
      detail: `${c.instructor.firstName} ${c.instructor.lastName}`,
      at: c.publishedAt,
    })),
    ...certificates.map((c) => ({
      type: 'certificate',
      label: `${c.student.firstName} ${c.student.lastName} earned a certificate for “${c.course.title}”`,
      detail: 'Certificate issued',
      at: c.issuedAt,
    })),
    ...gradings.map((g) => ({
      type: 'grading',
      label: `${g.student.firstName} ${g.student.lastName}'s “${g.assignment.title}” was graded`,
      detail: 'Assignment graded',
      at: g.gradedAt,
    })),
  ];

  events.sort((a, b) => new Date(b.at) - new Date(a.at));

  return events.slice(0, safeLimit);
}