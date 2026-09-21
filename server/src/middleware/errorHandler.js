import { env } from '../config/env.js';

export function errorHandler(err, req, res, _next) {
  const statusCode = err.statusCode || 500;
  const message = err.isOperational ? err.message : 'Internal server error';
  const code = err.code || 'INTERNAL_SERVER_ERROR';

  if (env.isProduction && !err.isOperational) {
    console.error('[Internal]', err.message);
  } else {
    console.error(`[Error] ${statusCode} — ${err.message}`);
    if (!env.isProduction && err.stack) {
      console.error(err.stack);
    }
  }

  res.status(statusCode).json({
    success: false,
    message,
    code,
  });
}