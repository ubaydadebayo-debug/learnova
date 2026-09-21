import { prisma } from '../config/prisma.js';
import { ApiError } from '../utils/ApiError.js';
import { listMyEnrollments } from './enrollment.service.js';
import { issueCertificateAndNotify } from './certificate.service.js';

async function getCourseLessonOrder(courseId) {
  const course = await prisma.course.findUnique({
    where: { id: courseId },
    select: {
      modules: {
        orderBy: { position: 'asc' },
        select: {
          id: true,
          title: true,
          lessons: {
            orderBy: { position: 'asc' },
            select: { id: true, title: true },
          },
        },
      },
    },
  });

  if (!course) return [];

  return course.modules.flatMap((module) =>
    module.lessons.map((lesson) => ({
      lessonId: lesson.id,
      lessonTitle: lesson.title,
      moduleId: module.id,
      moduleTitle: module.title,
    }))
  );
}

async function getCompletedSet(studentId, courseId) {
  const rows = await prisma.progress.findMany({
    where: { studentId, completed: true, lesson: { module: { courseId } } },
    select: { lessonId: true },
  });
  return new Set(rows.map((row) => row.lessonId));
}

async function summaryForCourse(studentId, courseId, lessonOrder, completedSet) {
  const total = lessonOrder.length;
  const completed = lessonOrder.filter((entry) => completedSet.has(entry.lessonId)).length;
  const percent = total === 0 ? 0 : Math.round((completed / total) * 100);
  const next = lessonOrder.find((entry) => !completedSet.has(entry.lessonId)) ?? null;
  const courseCompleted = total > 0 && completed === total;
  return { completed, total, percent, next, courseCompleted };
}

export async function markLessonComplete(studentId, lessonId) {
  const lesson = await prisma.lesson.findUnique({
    where: { id: lessonId },
    select: {
      id: true,
      module: {
        select: {
          id: true,
          courseId: true,
          course: { select: { id: true, title: true, status: true } },
        },
      },
    },
  });

  if (!lesson) {
    throw ApiError.notFound('Lesson not found');
  }

  const course = lesson.module.course;
  if (course.status === 'DRAFT') {
    throw ApiError.badRequest('This lesson is not available');
  }

  const enrollment = await prisma.enrollment.findUnique({
    where: { studentId_courseId: { studentId, courseId: course.id } },
    select: { id: true, status: true },
  });

  if (!enrollment || enrollment.status === 'CANCELLED') {
    throw ApiError.forbidden('Enroll in this course before completing lessons');
  }

  const now = new Date();
  const progress = await prisma.progress.upsert({
    where: { studentId_lessonId: { studentId, lessonId } },
    update: { completed: true, completedAt: now, enrollmentId: enrollment.id },
    create: {
      studentId,
      lessonId,
      enrollmentId: enrollment.id,
      completed: true,
      completedAt: now,
    },
  });

  const lessonOrder = await getCourseLessonOrder(course.id);
  const completedSet = await getCompletedSet(studentId, course.id);
  const courseProgress = await summaryForCourse(studentId, course.id, lessonOrder, completedSet);

  if (courseProgress.courseCompleted && enrollment.status !== 'COMPLETED') {
    await prisma.enrollment.update({
      where: { id: enrollment.id },
      data: { status: 'COMPLETED', completedAt: now },
    });
    await issueCertificateAndNotify(studentId, course.id);
  }

  return { progress, courseProgress };
}

export async function markLessonIncomplete(studentId, lessonId) {
  const lesson = await prisma.lesson.findUnique({
    where: { id: lessonId },
    select: { id: true, module: { select: { courseId: true } } },
  });

  if (!lesson) {
    throw ApiError.notFound('Lesson not found');
  }

  const enrollment = await prisma.enrollment.findUnique({
    where: { studentId_courseId: { studentId, courseId: lesson.module.courseId } },
    select: { id: true, status: true },
  });

  if (!enrollment || enrollment.status === 'CANCELLED') {
    throw ApiError.forbidden('Enroll in this course before tracking lessons');
  }

  const updated = await prisma.progress.upsert({
    where: { studentId_lessonId: { studentId, lessonId } },
    update: { completed: false, completedAt: null },
    create: { studentId, lessonId, enrollmentId: enrollment.id, completed: false },
  });

  if (enrollment.status === 'COMPLETED') {
    await prisma.enrollment.update({
      where: { id: enrollment.id },
      data: { status: 'ACTIVE', completedAt: null },
    });
  }

  const lessonOrder = await getCourseLessonOrder(lesson.module.courseId);
  const completedSet = await getCompletedSet(studentId, lesson.module.courseId);
  const courseProgress = await summaryForCourse(studentId, lesson.module.courseId, lessonOrder, completedSet);

  return { progress: updated, courseProgress };
}

export async function getProgressSummary(studentId) {
  const enrollments = await listMyEnrollments(studentId);

  const enrolled = enrollments.length;
  const completedCourses = enrollments.filter((entry) => entry.enrollment.status === 'COMPLETED').length;
  const lessonsCompleted = enrollments.reduce((sum, entry) => sum + entry.progress.completed, 0);
  const totalLessons = enrollments.reduce((sum, entry) => sum + entry.progress.total, 0);
  const averagePercent =
    enrolled === 0 ? 0 : Math.round(enrollments.reduce((sum, entry) => sum + entry.progress.percent, 0) / enrolled);

  const continueLearning =
    enrollments.find((entry) => entry.continue)?.continue ?? null;
  const continueCourse =
    enrollments.find((entry) => entry.continue)?.course ?? null;

  return {
    enrolled,
    completedCourses,
    lessonsCompleted,
    totalLessons,
    averagePercent,
    continue:
      continueLearning && continueCourse
        ? {
            ...continueLearning,
            courseId: continueCourse.id,
            courseSlug: continueCourse.slug,
            courseTitle: continueCourse.title,
          }
        : null,
  };
}