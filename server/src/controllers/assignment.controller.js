import { asyncHandler } from '../utils/asyncHandler.js';
import { sendSuccess } from '../utils/ApiResponse.js';
import {
  getAssignment,
  listAssignments,
  submitAssignment,
  downloadSubmissionFile,
} from '../services/assignment.service.js';
import { sanitizeFileName } from '../config/upload.js';

const ASSIGNMENTS_FILE_PREFIX = '/uploads/assignments';

export const listAssignmentsController = asyncHandler(async (req, res) => {
  const assignments = await listAssignments(req.user.id);
  sendSuccess(res, 200, 'Assignments retrieved successfully', { assignments });
});

export const getAssignmentController = asyncHandler(async (req, res) => {
  const assignment = await getAssignment(req.user.id, req.params.assignmentId);
  sendSuccess(res, 200, 'Assignment retrieved successfully', { assignment });
});

export const submitAssignmentController = asyncHandler(async (req, res) => {
  const file = req.file
    ? {
        fileUrl: `${ASSIGNMENTS_FILE_PREFIX}/${req.file.filename}`,
        fileName: sanitizeFileName(req.file.originalname),
        fileSize: req.file.size,
      }
    : null;

  const result = await submitAssignment(req.user.id, req.params.assignmentId, {
    text: typeof req.body.text === 'string' && req.body.text.trim() ? req.body.text.trim() : undefined,
    file,
  });
  sendSuccess(res, 201, 'Assignment submitted successfully', result);
});

export const downloadSubmissionFileController = asyncHandler(async (req, res) => {
  await downloadSubmissionFile(req.user, req.params.submissionId, res);
});