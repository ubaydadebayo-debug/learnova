import { prisma } from '../config/prisma.js';
import { ApiError } from '../utils/ApiError.js';
import { slugify, uniqueSlug } from '../utils/slug.js';

export async function listCategories() {
  return prisma.category.findMany({
    orderBy: { name: 'asc' },
    select: {
      id: true,
      name: true,
      slug: true,
      description: true,
      icon: true,
      _count: { select: { courses: true } },
    },
  });
}

export async function createCategory({ name, slug, description, icon }) {
  const finalSlug = await uniqueSlug(slug || name, async (value) => {
    const existing = await prisma.category.findUnique({ where: { slug: value }, select: { id: true } });
    return Boolean(existing);
  });

  return prisma.category.create({ data: { name, slug: finalSlug, description, icon } });
}

export async function updateCategory(id, { name, slug, description, icon }) {
  const existing = await prisma.category.findUnique({ where: { id }, select: { id: true } });
  if (!existing) {
    throw ApiError.notFound('Category not found');
  }

  const data = {};
  if (name !== undefined) data.name = name;
  if (slug !== undefined) data.slug = slugify(slug);
  if (description !== undefined) data.description = description ?? null;
  if (icon !== undefined) data.icon = icon ?? null;

  if (data.slug !== undefined) {
    const conflict = await prisma.category.findUnique({ where: { slug: data.slug }, select: { id: true } });
    if (conflict && conflict.id !== id) {
      throw ApiError.conflict('A category with this slug already exists');
    }
  }

  return prisma.category.update({ where: { id }, data });
}

export async function deleteCategory(id) {
  const existing = await prisma.category.findUnique({
    where: { id },
    select: { id: true, _count: { select: { courses: true } } },
  });

  if (!existing) {
    throw ApiError.notFound('Category not found');
  }

  if (existing._count.courses > 0) {
    throw ApiError.conflict('Cannot delete a category that still has courses');
  }

  await prisma.category.delete({ where: { id } });
}