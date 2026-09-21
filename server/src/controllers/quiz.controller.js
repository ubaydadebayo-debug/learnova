import { asyncHandler } from '../utils/asyncHandler.js';
import { sendSuccess } from '../utils/ApiResponse.js';
import { getQuiz, submitQuiz } from '../services/quiz.service.js';

export const getQuizController = asyncHandler(async (req, res) => {
  const data = await getQuiz(req.user.id, req.params.quizId);
  sendSuccess(res, 200, 'Quiz retrieved successfully', data);
});

export const submitQuizController = asyncHandler(async (req, res) => {
  const result = await submitQuiz(req.user.id, req.params.quizId, req.body.answers);
  sendSuccess(res, 201, 'Quiz submitted successfully', result);
});