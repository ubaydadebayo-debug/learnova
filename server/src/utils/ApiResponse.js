export function sendSuccess(res, statusCode, message, data = undefined) {
  const body = { success: true, message };
  if (data !== undefined) body.data = data;
  return res.status(statusCode).json(body);
}