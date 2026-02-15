// catch any error and send 500
const response = require("../utils/response");

function errorHandler(err, req, res, next) {
  console.error(err);
  return response.serverError(res, err.message || "Internal server error");
}

module.exports = { errorHandler };
