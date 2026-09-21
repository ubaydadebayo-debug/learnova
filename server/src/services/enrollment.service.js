import { prisma } from '../config/prisma.js';
import { ApiError } from '../utils/ApiError.js';
import { createNotification } from './notification.service.js';
import { NOTIFICATION_TYPES } from '../constants/index.js';

export const studentCourseCardSelect = {
  id: true,
  title: true,
  slug: true,
  shortDescription: true,
  thumbnailUrl: true,
  level: true,
  durationMinutes: true,
  ratingAverage: true,
  ratingCount: true,
  instructor: { select: { id: true, firstName: true, lastName: true, avatarUrl: true, title: true } },
  category: { select: { id: true, name: true, slug: true, icon: true } },
};

function flattenLessons(modules) {
  return modules.flatMap((module) =>
    module.lessons.map((lesson) => ({
      id: lesson.id,
      title: lesson.title,
      position: lesson.position,
      moduleId: module.id,
      moduleTitle: module.title,
      modulePosition: module.position,
    }))
  );
}

export async function enrollStudent(studentId, courseId) {
  const course = await prisma.course.findUnique({
    where: { id: courseId },
    select: { id: true, title: true, status: true },
  });

  if (!course) {
    throw ApiError.notFound('Course not found');
  }
  if (course.status !== 'PUBLISHED') {
    throw ApiError.badRequest('This course is not available for enrollment');
  }

  const existing = await prisma.enrollment.findUnique({
    where: { studentId_courseId: { studentId, courseId } },
    select: { id: true, status: true },
  });

  if (existing && existing.status === 'ACTIVE') {
    throw ApiError.conflict('You are already enrolled in this course');
  }

  const enrollment = existing
    ? await prisma.enrollment.update({
        where: { id: existing.id },
        data: { status: 'ACTIVE', enrolledAt: new Date(), completedAt: null },
      })
    : await prisma.enrollment.create({ data: { studentId, courseId } });

  await createNotification({
    userId: studentId,
    type: NOTIFICATION_TYPES.ENROLLMENT,
    title: 'Course enrolled',
    message: `You are now enrolled in ${course.title}. Start learning today.`,
    link: `/student/learn/${courseId}`,
  });

  return enrollment;
}

export async function cancelEnrollment(studentId, courseId) {
  const enrollment = await prisma.enrollment.findUnique({
    where: { studentId_courseId: { studentId, courseId } },
    select: { id: true, status: true },
  });

  if (!enrollment || enrollment.status === 'CANCELLED') {
    throw ApiError.notFound('You are not actively enrolled in this course');
  }

  return prisma.enrollment.update({
    where: { id: enrollment.id },
    data: { status: 'CANCELLED', completedAt: null },
  });
}

export async function listMyEnrollments(studentId) {
  const enrollments = await prisma.enrollment.findMany({
    where: { studentId, status: { in: ['ACTIVE', 'COMPLETED'] } },
    orderBy: { enrolledAt: 'desc' },
    select: {
      id: true,
      status: true,
      enrolledAt: true,
      completedAt: true,
      course: {
        select: {
          ...studentCourseCardSelect,
          modules: {
            orderBy: { position: 'asc' },
            select: {
              id: true,
              title: true,
              position: true,
              lessons: {
                orderBy: { position: 'asc' },
                select: { id: true, title: true, position: true },
              },
            },
          },
        },
      },
    },
  });

  const completedRows = await prisma.progress.findMany({
    where: { studentId, completed: true },
    select: { lessonId: true },
  });
  const completedLessonIds = new Set(completedRows.map((row) => row.lessonId));

  const coursesWithProgress = enrollments.map((enrollment) => {
    const lessons = flattenLessons(enrollment.course.modules);
    const total = lessons.length;
    const completed = lessons.filter((lesson) => completedLessonIds.has(lesson.id)).length;
    const percent = total === 0 ? 0 : Math.round((completed / total) * 100);
    const next = lessons.find((lesson) => !completedLessonIds.has(lesson.id)) ?? null;

    const { modules, ...course } = enrollment.course;
    return {
      enrollment: {
        id: enrollment.id,
        status: enrollment.status,
        enrolledAt: enrollment.enrolledAt,
        completedAt: enrollment.completedAt,
      },
      progress: { completed, total, percent },
      continue: next
        ? {
            lessonId: next.id,
            lessonTitle: next.title,
            moduleId: next.moduleId,
            moduleTitle: next.moduleTitle,
          }
        : null,
      course,
    };
  });

  return coursesWithProgress;
}

export async function getEnrollmentByCourse(studentId, courseId) {
  const enrollment = await prisma.enrollment.findUnique({
    where: { studentId_courseId: { studentId, courseId } },
    select: { id: true, status: true, enrolledAt: true, completedAt: true },
  });

  if (!enrollment || enrollment.status === 'CANCELLED') {
    throw ApiError.notFound('You are not enrolled in this course');
  }

  const course = await prisma.course.findUnique({
    where: { id: courseId },
    select: {
      id: true,
      title: true,
      slug: true,
      shortDescription: true,
      description: true,
      thumbnailUrl: true,
      level: true,
      durationMinutes: true,
      instructor: { select: { id: true, firstName: true, lastName: true, avatarUrl: true, title: true } },
      category: { select: { id: true, name: true, slug: true, icon: true } },
      modules: {
        orderBy: { position: 'asc' },
        select: {
          id: true,
          title: true,
          description: true,
          position: true,
          lessons: {
            orderBy: { position: 'asc' },
            select: {
              id: true,
              title: true,
              content: true,
              videoUrl: true,
              durationMinutes: true,
              resources: {
                select: { id: true, title: true, type: true, url: true, size: true },
              },
            },
          },
          quizzes: {
            orderBy: { position: 'asc' },
            select: { id: true, title: true, position: true },
          },
          assignments: {
            orderBy: { position: 'asc' },
            select: { id: true, title: true, instructions: true, points: true, position: true },
          },
        },
      },
    },
  });

  if (!course) {
    throw ApiError.notFound('Course not found');
  }

  const completedRows = await prisma.progress.findMany({
    where: { studentId, lesson: { module: { courseId } }, completed: true },
    select: { lessonId: true, completedAt: true },
  });
  const completedMap = new Map(completedRows.map((row) => [row.lessonId, row]));

  const lessons = [];
  const modulesWithCompletion = course.modules.map((module) => {
    const moduleLessons = module.lessons.map((lesson) => {
      lessons.push({ id: lesson.id, moduleId: module.id, moduleTitle: module.title });
      return { ...lesson, completed: completedMap.has(lesson.id) };
    });
    return { ...module, lessons: moduleLessons, completed: moduleLessons.length > 0 && moduleLessons.every((lesson) => lesson.completed) };
  });

  const total = lessons.length;
  const completed = lessons.filter((lesson) => completedMap.has(lesson.id)).length;
  const percent = total === 0 ? 0 : Math.round((completed / total) * 100);
  const orderedLessons = flattenLessons(modulesWithCompletion);
  const nextLesson = orderedLessons.find((lesson) => !completedMap.has(lesson.id)) ?? null;

  return {
    enrollment: {
      id: enrollment.id,
      status: enrollment.status,
      enrolledAt: enrollment.enrolledAt,
      completedAt: enrollment.completedAt,
    },
    progress: { completed, total, percent },
    continue: nextLesson
      ? {
          lessonId: nextLesson.id,
          lessonTitle: nextLesson.title,
          moduleId: nextLesson.moduleId,
          moduleTitle: nextLesson.moduleTitle,
        }
      : null,
    course: { ...course, modules: modulesWithCompletion },
  };
}