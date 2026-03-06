const AppError = require('../utils/appError');

function validate(schema) {
  return (req, res, next) => {
    const errors = schema(req);

    if (errors.length > 0) {
      return next(new AppError('Validation failed', 400, errors));
    }

    return next();
  };
}

function requireNumericParam(paramName) {
  return (req) => {
    const value = req.params[paramName];
    return /^\d+$/.test(String(value))
      ? []
      : [{ field: `params.${paramName}`, message: 'Must be a numeric identifier' }];
  };
}

function requireBody(fields) {
  return (req) => {
    const errors = [];

    fields.forEach((field) => {
      if (!Object.prototype.hasOwnProperty.call(req.body, field)) {
        errors.push({ field: `body.${field}`, message: 'Field is required' });
      }
    });

    return errors;
  };
}

module.exports = {
  validate,
  requireNumericParam,
  requireBody,
};
