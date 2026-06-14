const ALLOWED_OPERATORS = new Set([
  '$and',
  '$or',
  '$nor',
  '$eq',
  '$ne',
  '$gt',
  '$gte',
  '$lt',
  '$lte',
  '$in',
  '$nin',
  '$exists',
  '$regex'
]);

const FIELD_NAME_PATTERN = /^[a-zA-Z0-9_.]+$/;
const MAX_DEPTH = 5;
const MAX_ARRAY_LENGTH = 100;

const sanitizeValue = (value, depth) => {
  if (depth > MAX_DEPTH) {
    throw new Error('Query is too deeply nested');
  }

  if (Array.isArray(value)) {
    if (value.length > MAX_ARRAY_LENGTH) {
      throw new Error('Query array is too large');
    }
    return value.map((item) => sanitizeValue(item, depth + 1));
  }

  if (value && typeof value === 'object') {
    return sanitizeQuery(value, depth + 1);
  }

  return value;
};

const sanitizeQuery = (query, depth = 0) => {
  if (!query || typeof query !== 'object' || Array.isArray(query)) {
    throw new Error('Query must be a valid object');
  }

  const sanitized = {};

  for (const [key, value] of Object.entries(query)) {
    if (key.startsWith('$')) {
      if (!ALLOWED_OPERATORS.has(key)) {
        throw new Error(`Unsupported query operator: ${key}`);
      }
      sanitized[key] = sanitizeValue(value, depth);
      continue;
    }

    if (!FIELD_NAME_PATTERN.test(key)) {
      throw new Error(`Invalid field name in query: ${key}`);
    }

    sanitized[key] = sanitizeValue(value, depth);
  }

  return sanitized;
};

module.exports = { sanitizeQuery };
