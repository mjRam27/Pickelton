import { HttpError } from "../utils/http-error.js";

export const validate = (schema) => (request, _response, next) => {
  const result = schema.safeParse({ body: request.body, params: request.params, query: request.query });
  if (!result.success) return next(new HttpError(400, "Validation failed", result.error.flatten()));
  request.validated = result.data;
  next();
};
