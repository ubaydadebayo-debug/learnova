import { Router } from 'express';
import { authenticate } from '../middleware/authenticate.js';
import { loadAuthenticatedUser, requireRoles, requireApprovedInstructor } from '../middleware/authorize.js';

// Stage 1 placeholder router. Endpoints are implemented in later stages.
export function createPlaceholderRouter(groupName, options = {}) {
  const router = Router();

  const guards = [];
  if (options.auth) {
    guards.push(authenticate, loadAuthenticatedUser);
    if (options.roles && options.roles.length > 0) {
      guards.push(requireRoles(...options.roles));
    }
    if (options.requireApprovedInstructor) {
      guards.push(requireApprovedInstructor);
    }
  }

  router.get('/', guards, (req, res) => {
    res.status(501).json({
      success: false,
      message: `${groupName} endpoints are not implemented yet (planned for a later stage)`,
      code: 'NOT_IMPLEMENTED',
    });
  });

  return router;
}