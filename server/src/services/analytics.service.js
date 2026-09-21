import { prisma } from '../config/prisma.js';

const assignmentStatsFromRows = (rows) => {
  const statusCounts = { PENDING: 0, SUBMITTED: 0, GRADED: 0, LATE: 0 };
  const grades = [];
  for (const row of rows) {
    statusCounts[row.status] = (statusCounts[row.status] ?? 0) + 1;
    if (row.status === 'GRADED' && row.grade !== null && row.grade !== undefined) {
      grades.push(row.grade);
    }
  }
  const total = rows.length;
  const pending = (statusCounts.PENDING ?? 0) + (statusCounts.SUBMITTED ?? 0) + (statusCounts.LATE ?? 0);
  const graded = statusCounts.GRADED ?? 0;
  const averageGrade = grades.length > 0 ? Math.round(grades.reduce((sum, grade) => sum + grade, 0) / grades.length) : null;
  return { total, ...statusCounts, pending, graded, averageGrade };
};

const quizStatsFromRows = (rows) => {
  const submitted = rows.filter((row) => row.submittedAt !== null);
  const averagePercentage =
    submitted.length > 0
      ? Math.round(submitted.reduce((sum, row) => sum + (row.percentage ?? 0), 0) / submitted.length)
      : null;
  const passed = submitted.filter((row) => row.passed === true).length;
  return { attempts: submitted.length, passed, averagePercentage };
};

export async function getInstructorAnalytics(userId) {
  const [courses, enrollmentRows, certificateRows, submissionRows, quizRows, studentRows] = await Promise.all([
    prisma.course.findMany({
      where: { instructorId: userId },
      orderBy: { updatedAt: 'desc' },
      select: {
        id: true,
        title: true,
        slug: true,
        status: true,
        level: true,
        thumbnailUrl: true,
        ratingAverage: true,
        ratingCount: true,
        publishedAt: true,
      },
    }),
    prisma.enrollment.findMany({
      where: { course: { instructorId: userId } },
      select: { courseId: true, status: true },
    }),
    prisma.certificate.findMany({
      where: { course: { instructorId: userId } },
      select: { courseId: true },
    }),
    prisma.submission.findMany({
      where: { assignment: { module: { course: { instructorId: userId } } } },
      select: {
        assignment: { select: { module: { select: { courseId: true } } } },
        status: true,
        grade: true,
      },
    }),
    prisma.quizAttempt.findMany({
      where: { quiz: { module: { course: { instructorId: userId } } } },
      select: {
        quiz: { select: { module: { select: { courseId: true } } } },
        percentage: true,
        passed: true,
        submittedAt: true,
      },
    }),
    prisma.enrollment.findMany({
      where: { course: { instructorId: userId }, status: { not: 'CANCELLED' } },
      distinct: ['studentId'],
      select: { studentId: true, courseId: true },
    }),
  ]);

  const courseIds = courses.map((course) => course.id);

  const [lessonRows, progressRows] = await Promise.all([
    courseIds.length > 0
      ? prisma.lesson.findMany({
          where: { module: { courseId: { in: courseIds } } },
          select: { module: { select: { courseId: true } } },
        })
      : Promise.resolve([]),
    courseIds.length > 0
      ? prisma.progress.findMany({
          where: { completed: true, lesson: { module: { courseId: { in: courseIds } } } },
          select: { lesson: { select: { module: { select: { courseId: true } } } } },
        })
      : Promise.resolve([]),
  ]);

  const lessonTotalByCourse = {};
  for (const row of lessonRows) {
    const courseId = row.module.courseId;
    lessonTotalByCourse[courseId] = (lessonTotalByCourse[courseId] ?? 0) + 1;
  }

  const lessonCompletedByCourse = {};
  for (const row of progressRows) {
    const courseId = row.lesson.module.courseId;
    lessonCompletedByCourse[courseId] = (lessonCompletedByCourse[courseId] ?? 0) + 1;
  }

  const enrollmentCountByCourse = {};
  const enrollmentStatusByCourse = {};
  for (const row of enrollmentRows) {
    enrollmentCountByCourse[row.courseId] = (enrollmentCountByCourse[row.courseId] ?? 0) + 1;
    if (!enrollmentStatusByCourse[row.courseId]) enrollmentStatusByCourse[row.courseId] = {};
    enrollmentStatusByCourse[row.courseId][row.status] = (enrollmentStatusByCourse[row.courseId][row.status] ?? 0) + 1;
  }

  const certificatesByCourse = {};
  for (const row of certificateRows) {
    certificatesByCourse[row.courseId] = (certificatesByCourse[row.courseId] ?? 0) + 1;
  }

  const submissionsByCourse = {};
  for (const row of submissionRows) {
    const courseId = row.assignment.module.courseId;
    if (!submissionsByCourse[courseId]) submissionsByCourse[courseId] = [];
    submissionsByCourse[courseId].push(row);
  }

  const quizzesByCourse = {};
  for (const row of quizRows) {
    const courseId = row.quiz.module.courseId;
    if (!quizzesByCourse[courseId]) quizzesByCourse[courseId] = [];
    quizzesByCourse[courseId].push(row);
  }

  const studentsByCourse = {};
  for (const row of studentRows) {
    studentsByCourse[row.courseId] = (studentsByCourse[row.courseId] ?? 0) + 1;
  }

  const courseStats = courses.map((course) => {
    const enrollments = enrollmentStatusByCourse[course.id] ?? { ACTIVE: 0, COMPLETED: 0, CANCELLED: 0 };
    const totalEnrollments = enrollmentCountByCourse[course.id] ?? 0;
    const completedEnrollments = enrollments.COMPLETED ?? 0;
    const lessonTotal = lessonTotalByCourse[course.id] ?? 0;
    const lessonCompleted = lessonCompletedByCourse[course.id] ?? 0;
    const submissions = assignmentStatsFromRows(submissionsByCourse[course.id] ?? []);
    const quizzes = quizStatsFromRows(quizzesByCourse[course.id] ?? []);

    return {
      ...course,
      stats: {
        students: studentsByCourse[course.id] ?? 0,
        enrollments: {
          total: totalEnrollments,
          ACTIVE: enrollments.ACTIVE ?? 0,
          COMPLETED: completedEnrollments,
          CANCELLED: enrollments.CANCELLED ?? 0,
        },
        completionRate: totalEnrollments === 0 ? 0 : Math.round((completedEnrollments / totalEnrollments) * 100),
        lessons: { total: lessonTotal, completed: lessonCompleted },
        progressRate: lessonTotal === 0 ? 0 : Math.round((lessonCompleted / lessonTotal) * 100),
        quizzes,
        assignments: submissions,
        certificates: certificatesByCourse[course.id] ?? 0,
      },
    };
  });

  const ratedCourses = courses.filter((course) => course.ratingCount > 0);
  const averageRating =
    ratedCourses.length > 0
      ? Math.round((ratedCourses.reduce((sum, course) => sum + course.ratingAverage, 0) / ratedCourses.length) * 10) / 10
      : null;

  const published = courses.filter((course) => course.status === 'PUBLISHED').length;
  const drafts = courses.filter((course) => course.status === 'DRAFT').length;
  const archived = courses.filter((course) => course.status === 'ARCHIVED').length;

  const totalEnrollments = enrollmentRows.filter((row) => row.status !== 'CANCELLED').length;
  const activeEnrollments = enrollmentRows.filter((row) => row.status === 'ACTIVE').length;
  const completedEnrollments = enrollmentRows.filter((row) => row.status === 'COMPLETED').length;

  const allSubmissions = assignmentStatsFromRows(submissionRows);
  const allQuizzes = quizStatsFromRows(quizRows);

  const uniqueStudents = new Set(studentRows.map((row) => row.studentId)).size;

  return {
    metrics: {
      totalCourses: courses.length,
      published,
      drafts,
      archived,
      students: uniqueStudents,
      totalEnrollments,
      activeEnrollments,
      completedEnrollments,
      completionRate: totalEnrollments === 0 ? 0 : Math.round((completedEnrollments / totalEnrollments) * 100),
      pendingSubmissions: allSubmissions.pending,
      gradedSubmissions: allSubmissions.graded,
      quizAttempts: allQuizzes.attempts,
      averageQuizScore: allQuizzes.averagePercentage,
      certificates: certificateRows.length,
      averageRating,
    },
    courses: courseStats,
  };
}

export async function getCourseAnalytics(courseId) {
  const [course, enrollmentRows, certificateRows, submissionRows, quizRows, lessonRows, progressRows] = await Promise.all([
    prisma.course.findFirst({
      where: { id: courseId },
      select: {
        id: true,
        title: true,
        slug: true,
        status: true,
        level: true,
        thumbnailUrl: true,
        ratingAverage: true,
        ratingCount: true,
        publishedAt: true,
        instructor: { select: { id: true, firstName: true, lastName: true } },
      },
    }),
    prisma.enrollment.findMany({
      where: { courseId },
      select: { status: true, enrolledAt: true },
    }),
    prisma.certificate.count({ where: { courseId } }),
    prisma.submission.findMany({
      where: { assignment: { module: { courseId } } },
      select: { status: true, grade: true },
    }),
    prisma.quizAttempt.findMany({
      where: { quiz: { module: { courseId } } },
      select: { percentage: true, passed: true, submittedAt: true },
    }),
    prisma.lesson.count({ where: { module: { courseId } } }),
    prisma.progress.count({ where: { completed: true, lesson: { module: { courseId } } } }),
  ]);

  if (!course) return null;

  const statusCounts = { ACTIVE: 0, COMPLETED: 0, CANCELLED: 0 };
  for (const row of enrollmentRows) statusCounts[row.status] = (statusCounts[row.status] ?? 0) + 1;
  const totalEnrollments = statusCounts.ACTIVE + statusCounts.COMPLETED;
  const completed = statusCounts.COMPLETED;

  return {
    ...course,
    stats: {
      enrollments: { total: enrollmentRows.length, ...statusCounts },
      completionRate: totalEnrollments === 0 ? 0 : Math.round((completed / totalEnrollments) * 100),
      lessons: { total: lessonRows, completed: progressRows },
      progressRate: lessonRows === 0 ? 0 : Math.round((progressRows / lessonRows) * 100),
      quizzes: quizStatsFromRows(quizRows),
      assignments: assignmentStatsFromRows(submissionRows),
      certificates: certificateRows,
    },
  };
}

export async function listCourseStudents(courseId) {
  const course = await prisma.course.findFirst({
    where: { id: courseId },
    select: { id: true, title: true, slug: true, instructor: { select: { id: true } } },
  });
  if (!course) return null;

  const [enrollments, totalLessons, progressRows] = await Promise.all([
    prisma.enrollment.findMany({
      where: { courseId, status: { not: 'CANCELLED' } },
      orderBy: { enrolledAt: 'desc' },
      select: {
        id: true,
        status: true,
        enrolledAt: true,
        completedAt: true,
        student: {
          select: { id: true, firstName: true, lastName: true, email: true, avatarUrl: true },
        },
      },
    }),
    prisma.lesson.count({ where: { module: { courseId } } }),
    prisma.progress.findMany({
      where: { completed: true, lesson: { module: { courseId } } },
      select: { studentId: true },
    }),
  ]);

  const completedByStudent = {};
  for (const row of progressRows) {
    completedByStudent[row.studentId] = (completedByStudent[row.studentId] ?? 0) + 1;
  }

  const students = enrollments.map((enrollment) => {
    const completed = completedByStudent[enrollment.student.id] ?? 0;
    return {
      enrollmentId: enrollment.id,
      status: enrollment.status,
      enrolledAt: enrollment.enrolledAt,
      completedAt: enrollment.completedAt,
      progress: {
        completed,
        total: totalLessons,
        percent: totalLessons === 0 ? 0 : Math.round((completed / totalLessons) * 100),
      },
      student: enrollment.student,
    };
  });

  return { course: { id: course.id, title: course.title, slug: course.slug }, students };
}

export async function listInstructorStudents(userId) {
  const courseIds = (
    await prisma.course.findMany({ where: { instructorId: userId }, select: { id: true } })
  ).map((course) => course.id);

  if (courseIds.length === 0) return [];

  const [enrollments, progressRows] = await Promise.all([
    prisma.enrollment.findMany({
      where: { courseId: { in: courseIds }, status: { not: 'CANCELLED' } },
      orderBy: { enrolledAt: 'desc' },
      select: {
        id: true,
        status: true,
        enrolledAt: true,
        completedAt: true,
        courseId: true,
        student: {
          select: { id: true, firstName: true, lastName: true, email: true, avatarUrl: true },
        },
        course: { select: { id: true, title: true, slug: true, status: true } },
      },
    }),
    prisma.progress.findMany({
      where: { completed: true, lesson: { module: { courseId: { in: courseIds } } } },
      select: { studentId: true, lesson: { select: { module: { select: { courseId: true } } } } },
    }),
  ]);

  const completedByStudentCourse = {};
  for (const row of progressRows) {
    const courseId = row.lesson.module.courseId;
    const key = `${row.studentId}:${courseId}`;
    completedByStudentCourse[key] = (completedByStudentCourse[key] ?? 0) + 1;
  }

  const totalLessonsByCourse = {};
  const lessonRows = await prisma.lesson.findMany({
    where: { module: { courseId: { in: courseIds } } },
    select: { id: true, module: { select: { courseId: true } } },
  });
  for (const row of lessonRows) {
    totalLessonsByCourse[row.module.courseId] = (totalLessonsByCourse[row.module.courseId] ?? 0) + 1;
  }

  return enrollments.map((enrollment) => {
    const key = `${enrollment.studentId}:${enrollment.courseId}`;
    const completed = completedByStudentCourse[key] ?? 0;
    const total = totalLessonsByCourse[enrollment.courseId] ?? 0;
    return {
      enrollmentId: enrollment.id,
      status: enrollment.status,
      enrolledAt: enrollment.enrolledAt,
      completedAt: enrollment.completedAt,
      progress: {
        completed,
        total,
        percent: total === 0 ? 0 : Math.round((completed / total) * 100),
      },
      student: enrollment.student,
      course: enrollment.course,
    };
  });
}