import { prisma } from '../config/prisma.js';
import { ApiError } from '../utils/ApiError.js';

export async function createModule(courseId, { title, description }) {
  const last = await prisma.module.findFirst({
    where: { courseId },
    orderBy: { position: 'desc' },
    select: { position: true },
  });
  const position = (last?.position ?? -1) + 1;

  return prisma.module.create({
    data: { courseId, title, description, position },
    select: { id: true, title: true, description: true, position: true, courseId: true },
  });
}

export async function updateModule(moduleId, { title, description }) {
  const data = {};
  if (title !== undefined) data.title = title;
  if (description !== undefined) data.description = description ?? null;

  return prisma.module.update({
    where: { id: moduleId },
    data,
    select: { id: true, title: true, description: true, position: true, courseId: true },
  });
}

export async function deleteModule(moduleId) {
  await prisma.module.delete({ where: { id: moduleId } });
}

export async function reorderModules(courseId, orderedIds) {
  const existing = await prisma.module.findMany({ where: { courseId }, select: { id: true } });
  const existingIds = new Set(existing.map((item) => item.id));
  const uniqueIds = [...new Set(orderedIds)];

  if (uniqueIds.length !== existing.length || uniqueIds.some((id) => !existingIds.has(id))) {
    throw ApiError.badRequest('Module order must include exactly the current modules, each once');
  }

  await prisma.$transaction([
    ...uniqueIds.map((id, index) =>
      prisma.module.update({ where: { id }, data: { position: -(index + 1) } })
    ),
    ...uniqueIds.map((id, index) =>
      prisma.module.update({ where: { id }, data: { position: index } })
    ),
  ]);

  return prisma.module.findMany({ where: { courseId }, orderBy: { position: 'asc' } });
}