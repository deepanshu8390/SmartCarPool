// helper to send json success or error response
const success = (res, data, statusCode) => {
  if (statusCode == null) statusCode = 200;
  return res.status(statusCode).json({ success: true, data });
};

const created = (res, data) => {
  return res.status(201).json({ success: true, data });
};

const error = (res, message, statusCode = 400, code = "ERROR") => {
  return res.status(statusCode).json({ success: false, message, code });
};

const notFound = (res, message = "Not found") => {
  return res.status(404).json({ success: false, message, code: "NOT_FOUND" });
};

const unauthorized = (res, message = "Unauthorized") => {
  return res.status(401).json({ success: false, message, code: "UNAUTHORIZED" });
};

const forbidden = (res, message = "Forbidden") => {
  return res.status(403).json({ success: false, message, code: "FORBIDDEN" });
};

const serverError = (res, message = "Internal server error") => {
  return res.status(500).json({ success: false, message, code: "SERVER_ERROR" });
};

module.exports = {
  success,
  created,
  error,
  notFound,
  unauthorized,
  forbidden,
  serverError,
};
