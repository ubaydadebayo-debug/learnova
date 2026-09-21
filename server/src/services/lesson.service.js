import { prisma } from '../config/prisma.js';
import { ApiError } from '../utils/ApiError.js';

export async function createLesson(moduleId, { title, content, videoUrl, durationMinutes }) {
  const last = await prisma.lesson.findFirst({
    where: { moduleId },
    orderBy: { position: 'desc' },
    select: { position: true },
  });
  const position = (last?.position ?? -1) + 1;

  return prisma.lesson.create({
    data: {
      moduleId,
      title,
      content: content ?? '',
      videoUrl: videoUrl ?? null,
      durationMinutes: durationMinutes ?? null,
      position,
    },
    select: { id: true, title: true, content: true, videoUrl: true, durationMinutes: true, position: true, moduleId: true },
  });
}

export async function updateLesson(lessonId, { title, content, videoUrl, durationMinutes }) {
  const data = {};
  if (title !== undefined) data.title = title;
  if (content !== undefined) data.content = content;
  if (videoUrl !== undefined) data.videoUrl = videoUrl ?? null;
  if (durationMinutes !== undefined) data.durationMinutes = durationMinutes ?? null;

  return prisma.lesson.update({
    where: { id: lessonId },
    data,
    select: { id: true, title: true, content: true, videoUrl: true, durationMinutes: true, position: true, moduleId: true },
  });
}

export async function deleteLesson(lessonId) {
  await prisma.lesson.delete({ where: { id: lessonId } });
}

export async function reorderLessons(moduleId, orderedIds) {
  const existing = await prisma.lesson.findMany({ where: { moduleId }, select: { id: true } });
  const existingIds = new Set(existing.map((item) => item.id));
  const uniqueIds = [...new Set(orderedIds)];

  if (uniqueIds.length !== existing.length || uniqueIds.some((id) => !existingIds.has(id))) {
    throw ApiError.badRequest('Lesson order must include exactly the current lessons, each once');
  }

  await prisma.$transaction([
    ...uniqueIds.map((id, index) =>
      prisma.lesson.update({ where: { id }, data: { position: -(index + 1) } })
    ),
    ...uniqueIds.map((id, index) =>
      prisma.lesson.update({ where: { id }, data: { position: index } })
    ),
  ]);

  return prisma.lesson.findMany({ where: { moduleId }, orderBy: { position: 'asc' } });
}

export async function createResource(lessonId, { title, type, url, size }) {
  return prisma.resource.create({
    data: { lessonId, title, type, url, size: size ?? null },
    select: { id: true, title: true, type: true, url: true, size: true, lessonId: true },
  });
}

export async function deleteResource(resourceId) {
  await prisma.resource.delete({ where: { id: resourceId } });
}