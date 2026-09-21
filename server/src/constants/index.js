export const ROLES = Object.freeze({
  STUDENT: 'STUDENT',
  INSTRUCTOR: 'INSTRUCTOR',
  ADMIN: 'ADMIN',
});

export const ACCOUNT_STATUS = Object.freeze({
  ACTIVE: 'ACTIVE',
  PENDING: 'PENDING',
  SUSPENDED: 'SUSPENDED',
});

export const ERROR_CODES = Object.freeze({
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  UNAUTHORIZED: 'UNAUTHORIZED',
  FORBIDDEN: 'FORBIDDEN',
  NOT_FOUND: 'NOT_FOUND',
  CONFLICT: 'CONFLICT',
  TOO_MANY_REQUESTS: 'TOO_MANY_REQUESTS',
  INTERNAL_SERVER_ERROR: 'INTERNAL_SERVER_ERROR',
});

export const MESSAGES = Object.freeze({
  REGISTERED: 'Registration successful',
  LOGGED_IN: 'Login successful',
  LOGGED_OUT: 'Logged out successfully',
  USER_FETCHED: 'User retrieved successfully',
  EMAIL_IN_USE: 'An account with this email already exists',
  INVALID_CREDENTIALS: 'Invalid email or password',
  ACCOUNT_SUSPENDED: 'This account has been suspended',
  ACCOUNT_PENDING: 'This account is pending approval',
});

export const NOTIFICATION_TYPES = Object.freeze({
  CERTIFICATE: 'CERTIFICATE',
  SUBMISSION: 'SUBMISSION',
  GRADING: 'GRADING',
  ENROLLMENT: 'ENROLLMENT',
  ACCOUNT: 'ACCOUNT',
});