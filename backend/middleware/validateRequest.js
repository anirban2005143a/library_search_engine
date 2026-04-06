// Validates request body, params, or query against a Zod schema
// Usage:
//   validateRequest(schema) - validates req.body (default)
//   validateRequest(schema, "params") - validates req.params
//   validateRequest({ body: schema1, params: schema2 }) - validates multiple parts

const throwValidationError = (errors) => {
  const flatErrors = Object.values(errors)
    .flat()
    .filter(Boolean)
    .map((err) => err._errors)
    .flat();

  const error = new Error(flatErrors.join(", "));
  error.status = 400;
  error.code = "VALIDATION_ERROR";
  throw error;
};

export const validateRequest = (schema, part = "body") => {
  return (req, res, next) => {
    // Case 1: Object with multiple schemas (e.g., { body: schema1, params: schema2 })
    if (typeof schema === "object" && (schema.body || schema.params)) {
      if (schema.body) {
        const bodyResult = schema.body.safeParse(req.body);
        if (!bodyResult.success) {
          throwValidationError(bodyResult.error.format());
        }
      }

      if (schema.params) {
        const paramsResult = schema.params.safeParse(req.params);
        if (!paramsResult.success) {
          throwValidationError(paramsResult.error.format());
        }
      }

      return next();
    }

    // Case 2: Single schema with part specifier (e.g., validateRequest(schema, "params"))
    const result = schema.safeParse(req[part]);

    if (!result.success) {
      throwValidationError(result.error.format());
    }

    next();
  };
};
