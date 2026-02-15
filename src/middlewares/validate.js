// validate request body with zod schema
const response = require("../utils/response");

function validate(schema) {
  return function (req, res, next) {
    try {
      const result = schema.safeParse(req.body);
      if (!result.success) {
        const first = result.error.issues && result.error.issues[0];
        const msg = first && first.message ? first.message : "Validation failed";
        return response.error(res, msg, 400, "VALIDATION_ERROR");
      }
      req.body = result.data;
      next();
    } catch (err) {
      return response.error(res, "Validation error", 400, "VALIDATION_ERROR");
    }
  };
}

module.exports = { validate };
