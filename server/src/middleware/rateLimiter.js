import rateLimit, { ipKeyGenerator } from 'express-rate-limit';

export const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 300,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many requests, please try again later',
    code: 'TOO_MANY_REQUESTS',
  },
});

export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 30,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many authentication attempts, please try again later',
    code: 'TOO_MANY_REQUESTS',
  },
});

export const aiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 30,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many AI requests, please try again later',
    code: 'TOO_MANY_REQUESTS',
  },
});

// Keyed by the authenticated user so frequent polling (e.g. the
// notification unread-count used by the header bell) cannot drain the
// shared per-IP budget.
export const userHighFrequencyLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 600,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  keyGenerator: (req) => req.user?.id ?? ipKeyGenerator(req.ip),
  message: {
    success: false,
    message: 'Too many requests, please try again later',
    code: 'TOO_MANY_REQUESTS',
  },
});