import { asyncHandler } from '../utils/asyncHandler.js';
import { sendSuccess } from '../utils/ApiResponse.js';
import {
  getInstructorAssignment,
  gradeSubmission,
  listInstructorAssignments,
} from '../services/instructor-assignment.service.js';

export const listInstructorAssignmentsController = asyncHandler(async (req, res) => {
  const assignments = await listInstructorAssignments(req.user.id);
  sendSuccess(res, 200, 'Instructor assignments retrieved successfully', { assignments });
});

export const getInstructorAssignmentController = asyncHandler(async (req, res) => {
  const assignment = await getInstructorAssignment(req.user.id, req.params.assignmentId);
  sendSuccess(res, 200, 'Instructor assignment retrieved successfully', { assignment });
});

export const gradeSubmissionController = asyncHandler(async (req, res) => {
  const submission = await gradeSubmission(req.user.id, req.params.submissionId, req.body.grade, req.body.feedback);
  sendSuccess(res, 200, 'Submission graded successfully', { submission });
});