import { asyncHandler } from '../utils/asyncHandler.js';
import { sendSuccess } from '../utils/ApiResponse.js';
import {
  listStudentConversations,
  getConversationById,
  createStudentConversation,
  sendStudentMessage,
} from '../services/ai.service.js';

export const listConversationsController = asyncHandler(async (req, res) => {
  const conversations = await listStudentConversations(req.user.id);
  sendSuccess(res, 200, 'Conversations retrieved successfully', { conversations });
});

export const getConversationController = asyncHandler(async (req, res) => {
  const conversation = await getConversationById(req.user.id, req.params.conversationId);
  sendSuccess(res, 200, 'Conversation retrieved successfully', { conversation });
});

export const createConversationController = asyncHandler(async (req, res) => {
  const conversation = await createStudentConversation(req.user.id, req.body || {});
  sendSuccess(res, 201, 'Conversation created successfully', { conversation });
});

export const sendMessageController = asyncHandler(async (req, res) => {
  const result = await sendStudentMessage(req.user.id, req.params.conversationId, {
    ...req.body,
    courseTitle: req.body?.courseTitle,
    lessonTitle: req.body?.lessonTitle,
  });

  sendSuccess(res, 200, 'Message sent successfully', result);
});
