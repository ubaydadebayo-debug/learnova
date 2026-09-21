import { prisma } from '../config/prisma.js';
import { ApiError } from '../utils/ApiError.js';
import { uniqueSlug } from '../utils/slug.js';

const instructorSelect = {
  id: true,
  firstName: true,
  lastName: true,
  avatarUrl: true,
  title: true,
};

const categorySelect = {
  id: true,
  name: true,
  slug: true,
  icon: true,
};

export const courseCardSelect = {
  id: true,
  title: true,
  slug: true,
  shortDescription: true,
  thumbnailUrl: true,
  level: true,
  durationMinutes: true,
  ratingAverage: true,
  ratingCount: true,
  instructor: { select: instructorSelect },
  category: { select: categorySelect },
  _count: { select: { enrollments: true } },
};

const SORT_OPTIONS = {
  popular: [{ enrollments: { _count: 'desc' } }, { ratingAverage: 'desc' }],
  newest: { publishedAt: 'desc' },
  rating: [{ ratingAverage: 'desc' }, { ratingCount: 'desc' }],
  title: { title: 'asc' },
};

export async function listPublishedCourses({
  search,
  category,
  level,
  instructor,
  minRating,
  minDuration,
  maxDuration,
  sort = 'newest',
  page = 1,
  limit = 12,
}) {
  const where = { status: 'PUBLISHED' };

  if (search) {
    where.OR = [
      { title: { contains: search, mode: 'insensitive' } },
      { shortDescription: { contains: search, mode: 'insensitive' } },
      { description: { contains: search, mode: 'insensitive' } },
    ];
  }

  if (category) {
    where.category = { OR: [{ id: category }, { slug: category }] };
  }

  if (level) {
    where.level = level;
  }

  if (instructor) {
    where.instructor = { OR: [{ id: instructor }, { email: instructor }] };
  }

  const durationFilters = [];
  if (minDuration !== undefined && minDuration !== null) {
    durationFilters.push({ durationMinutes: { gte: minDuration } });
  }
  if (maxDuration !== undefined && maxDuration !== null) {
    durationFilters.push({ durationMinutes: { lte: maxDuration } });
  }
  if (durationFilters.length > 0) {
    where.AND = durationFilters;
  }

  if (minRating !== undefined && minRating !== null) {
    where.ratingAverage = { gte: minRating };
  }

  const safePage = Math.max(1, page);
  const safeLimit = Math.min(24, Math.max(1, limit));

  const [courses, total] = await Promise.all([
    prisma.course.findMany({
      where,
      select: courseCardSelect,
      orderBy: SORT_OPTIONS[sort] || SORT_OPTIONS.newest,
      skip: (safePage - 1) * safeLimit,
      take: safeLimit,
    }),
    prisma.course.count({ where }),
  ]);

  return {
    courses,
    pagination: {
      page: safePage,
      limit: safeLimit,
      total,
      totalPages: Math.ceil(total / safeLimit),
    },
  };
}

export async function getPublishedCourse(identifier) {
  const baseWhere = { status: 'PUBLISHED' };

  const detailSelect = {
    id: true,
    title: true,
    slug: true,
    shortDescription: true,
    description: true,
    outcomes: true,
    thumbnailUrl: true,
    level: true,
    durationMinutes: true,
    ratingAverage: true,
    ratingCount: true,
    publishedAt: true,
    instructor: { select: instructorSelect },
    category: { select: categorySelect },
    modules: {
      orderBy: { position: 'asc' },
      select: {
        id: true,
        title: true,
        description: true,
        position: true,
        lessons: {
          orderBy: { position: 'asc' },
          select: { id: true, title: true, durationMinutes: true, position: true },
        },
        quizzes: {
          orderBy: { position: 'asc' },
          select: { id: true, title: true, position: true },
        },
        assignments: {
          orderBy: { position: 'asc' },
          select: { id: true, title: true, points: true, position: true },
        },
      },
    },
    _count: { select: { enrollments: true } },
  };

  const byId = await prisma.course.findFirst({
    where: { ...baseWhere, id: identifier },
    select: detailSelect,
  });

  if (byId) return byId;

  return prisma.course.findFirst({
    where: { ...baseWhere, slug: identifier },
    select: detailSelect,
  });
}

const editableCourseSelect = {
  id: true,
  title: true,
  slug: true,
  shortDescription: true,
  description: true,
  outcomes: true,
  thumbnailUrl: true,
  level: true,
  status: true,
  durationMinutes: true,
  ratingAverage: true,
  ratingCount: true,
  publishedAt: true,
  instructorId: true,
  categoryId: true,
  category: { select: categorySelect },
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
          videoUrl: true,
          durationMinutes: true,
          position: true,
          resources: { select: { id: true, title: true, type: true, url: true, size: true } },
        },
      },
      quizzes: {
        orderBy: { position: 'asc' },
        select: {
          id: true,
          title: true,
          description: true,
          passingScore: true,
          timeLimitMinutes: true,
          maxAttempts: true,
          allowRetake: true,
          position: true,
          questions: {
            orderBy: { position: 'asc' },
            select: {
              id: true,
              type: true,
              prompt: true,
              explanation: true,
              points: true,
              position: true,
              options: {
                orderBy: { position: 'asc' },
                select: { id: true, text: true, isCorrect: true, position: true },
              },
            },
          },
        },
      },
      assignments: {
        orderBy: { position: 'asc' },
        select: {
          id: true,
          title: true,
          instructions: true,
          dueDate: true,
          points: true,
          position: true,
        },
      },
    },
  },
  _count: { select: { enrollments: true, certificates: true } },
};

export async function listInstructorCourses(userId) {
  const courses = await prisma.course.findMany({
    where: { instructorId: userId },
    orderBy: { updatedAt: 'desc' },
    select: {
      id: true,
      title: true,
      slug: true,
      shortDescription: true,
      thumbnailUrl: true,
      level: true,
      status: true,
      durationMinutes: true,
      ratingAverage: true,
      ratingCount: true,
      publishedAt: true,
      updatedAt: true,
      category: { select: categorySelect },
      modules: { select: { id: true, _count: { select: { lessons: true, quizzes: true, assignments: true } } } },
      _count: { select: { enrollments: true } },
    },
  });

  return courses.map((course) => ({
    ...course,
    stats: {
      modules: course.modules.length,
      lessons: course.modules.reduce((sum, m) => sum + m._count.lessons, 0),
      quizzes: course.modules.reduce((sum, m) => sum + m._count.quizzes, 0),
      assignments: course.modules.reduce((sum, m) => sum + m._count.assignments, 0),
      students: course._count.enrollments,
    },
  }));
}

export async function createCourse(userId, data) {
  const slug = await uniqueSlug(data.title || 'course', async (value) => {
    const existing = await prisma.course.findUnique({ where: { slug: value }, select: { id: true } });
    return Boolean(existing);
  });

  return prisma.course.create({
    data: {
      title: data.title,
      slug,
      shortDescription: data.shortDescription ?? null,
      description: data.description ?? null,
      outcomes: data.outcomes ?? [],
      thumbnailUrl: data.thumbnailUrl ?? null,
      level: data.level ?? 'BEGINNER',
      durationMinutes: data.durationMinutes ?? null,
      status: 'DRAFT',
      instructorId: userId,
      categoryId: data.categoryId,
    },
  });
}

export async function getInstructorCourse(courseId) {
  const course = await prisma.course.findUnique({
    where: { id: courseId },
    select: editableCourseSelect,
  });

  if (!course) {
    throw ApiError.notFound('Course not found');
  }

  return course;
}

export async function updateCourse(courseId, data) {
  const patch = {};
  if (data.title !== undefined) patch.title = data.title;
  if (data.shortDescription !== undefined) patch.shortDescription = data.shortDescription ?? null;
  if (data.description !== undefined) patch.description = data.description ?? null;
  if (data.outcomes !== undefined) patch.outcomes = data.outcomes;
  if (data.thumbnailUrl !== undefined) patch.thumbnailUrl = data.thumbnailUrl ?? null;
  if (data.level !== undefined) patch.level = data.level;
  if (data.durationMinutes !== undefined) patch.durationMinutes = data.durationMinutes ?? null;
  if (data.categoryId !== undefined) patch.categoryId = data.categoryId;
  if (data.status !== undefined) patch.status = data.status;

  if (data.title !== undefined) {
    patch.slug = await uniqueSlug(data.title, async (value) => {
      const existing = await prisma.course.findUnique({ where: { slug: value }, select: { id: true } });
      return existing && existing.id !== courseId;
    });
  }

  return prisma.course.update({ where: { id: courseId }, data: patch });
}

export async function deleteCourse(courseId) {
  await prisma.course.delete({ where: { id: courseId } });
}

export async function publishCourse(courseId) {
  const course = await prisma.course.findUnique({
    where: { id: courseId },
    select: {
      id: true,
      status: true,
      modules: { select: { _count: { select: { lessons: true } } } },
    },
  });

  if (!course) {
    throw ApiError.notFound('Course not found');
  }

  const hasContent = course.modules.some((module) => module._count.lessons > 0);
  if (!hasContent) {
    throw ApiError.badRequest('Add at least one module with a lesson before publishing');
  }

  return prisma.course.update({
    where: { id: courseId },
    data: { status: 'PUBLISHED', publishedAt: new Date() },
  });
}

export async function archiveCourse(courseId) {
  return prisma.course.update({
    where: { id: courseId },
    data: { status: 'ARCHIVED' },
  });
}

export async function listAdminCourses({ search, status, instructor, page = 1, limit = 12 }) {
  const where = {};

  if (search) {
    where.OR = [
      { title: { contains: search, mode: 'insensitive' } },
      { shortDescription: { contains: search, mode: 'insensitive' } },
    ];
  }
  if (status) where.status = status;
  if (instructor) where.instructor = { OR: [{ id: instructor }, { email: instructor }] };

  const safePage = Math.max(1, page);
  const safeLimit = Math.min(50, Math.max(1, limit));

  const [courses, total] = await Promise.all([
    prisma.course.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        title: true,
        slug: true,
        level: true,
        status: true,
        durationMinutes: true,
        ratingAverage: true,
        publishedAt: true,
        createdAt: true,
        instructor: { select: instructorSelect },
        category: { select: categorySelect },
        modules: { select: { _count: { select: { lessons: true } } } },
        _count: { select: { enrollments: true } },
      },
      skip: (safePage - 1) * safeLimit,
      take: safeLimit,
    }),
    prisma.course.count({ where }),
  ]);

  return {
    courses: courses.map((course) => ({
      ...course,
      stats: {
        lessons: course.modules.reduce((sum, m) => sum + m._count.lessons, 0),
        students: course._count.enrollments,
      },
    })),
    pagination: { page: safePage, limit: safeLimit, total, totalPages: Math.ceil(total / safeLimit) },
  };
}

export async function adminUpdateCourse(courseId, data) {
  const patch = {};
  if (data.status !== undefined) patch.status = data.status;
  if (data.title !== undefined) patch.title = data.title;
  if (data.categoryId !== undefined) patch.categoryId = data.categoryId;
  if (data.level !== undefined) patch.level = data.level;

  return prisma.course.update({ where: { id: courseId }, data: patch });
}