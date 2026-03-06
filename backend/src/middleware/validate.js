const AppError = require('../utils/appError');

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function validate(schema) {
  return (req, res, next) => {
    const errors = schema(req);

    if (errors.length > 0) {
      return next(new AppError('Validation failed', 400, errors));
    }

    return next();
  };
}

function mergeValidators(...validators) {
  return (req) => validators.flatMap((validator) => validator(req));
}

function requireNumericParam(paramName) {
  return (req) => {
    const value = req.params[paramName];
    return /^\d+$/.test(String(value))
      ? []
      : [{ field: `params.${paramName}`, message: 'Must be a numeric identifier' }];
  };
}

function requireUuidParam(paramName) {
  return (req) => {
    const value = req.params[paramName];
    return UUID_REGEX.test(String(value))
      ? []
      : [{ field: `params.${paramName}`, message: 'Must be a UUID' }];
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

function requireUuidBody(fieldName) {
  return (req) => {
    const value = req.body?.[fieldName];

    if (typeof value !== 'string' || !UUID_REGEX.test(value)) {
      return [{ field: `body.${fieldName}`, message: 'Must be a UUID string' }];
    }

    return [];
  };
}

function optionalUuidBody(fieldName) {
  return (req) => {
    const value = req.body?.[fieldName];
    if (value === undefined || value === null || value === '') {
      return [];
    }

    if (typeof value !== 'string' || !UUID_REGEX.test(value)) {
      return [{ field: `body.${fieldName}`, message: 'Must be a UUID string when provided' }];
    }

    return [];
  };
}

function requireNonEmptyStringBody(fieldName) {
  return (req) => {
    const value = req.body?.[fieldName];

    if (typeof value !== 'string' || value.trim().length === 0) {
      return [{ field: `body.${fieldName}`, message: 'Must be a non-empty string' }];
    }

    return [];
  };
}

function optionalStringBody(fieldName, maxLength = 300) {
  return (req) => {
    const value = req.body?.[fieldName];

    if (value === undefined || value === null) {
      return [];
    }

    if (typeof value !== 'string') {
      return [{ field: `body.${fieldName}`, message: 'Must be a string when provided' }];
    }

    if (value.length > maxLength) {
      return [{ field: `body.${fieldName}`, message: `Must be ${maxLength} characters or fewer` }];
    }

    return [];
  };
}

function optionalBooleanBody(fieldName) {
  return (req) => {
    const value = req.body?.[fieldName];
    if (value === undefined || value === null) {
      return [];
    }

    if (typeof value !== 'boolean') {
      return [{ field: `body.${fieldName}`, message: 'Must be a boolean when provided' }];
    }

    return [];
  };
}

module.exports = {
  validate,
  mergeValidators,
  requireNumericParam,
  requireUuidParam,
  requireBody,
  requireUuidBody,
  optionalUuidBody,
  requireNonEmptyStringBody,
  optionalStringBody,
  optionalBooleanBody,
};
