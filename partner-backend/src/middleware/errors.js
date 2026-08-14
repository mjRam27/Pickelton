import { ZodError } from "zod";
import { logger } from "../config/logger.js";

export function notFound(request, _response, next) {
  const error = new Error(`Route not found: ${request.method} ${request.originalUrl}`);
  error.status = 404;
  next(error);
}

export function errorHandler(error, request, response, _next) {
  const status = error.status ?? (error instanceof ZodError ? 400 : 500);
  if (status >= 500) logger.error({ error, requestId: request.id }, "Request failed");
  response.status(status).json({
    success: false,
    error: { message: status === 500 ? "Internal server error" : error.message, details: error.details }
  });
}
