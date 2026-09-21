import { asyncHandler } from '../utils/asyncHandler.js';
import { sendSuccess } from '../utils/ApiResponse.js';
import { listCategories } from '../services/category.service.js';

export const getCategories = asyncHandler(async (_req, res) => {
  const categories = await listCategories();
  sendSuccess(res, 200, 'Categories retrieved successfully', { categories });
});