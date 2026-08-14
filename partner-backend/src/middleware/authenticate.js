import jwt from "jsonwebtoken";
import { env } from "../config/env.js";
import { HttpError } from "../utils/http-error.js";

export function authenticate(request, _response, next) {
  const token = request.headers.authorization?.replace(/^Bearer\s+/i, "");
  if (!token) return next(new HttpError(401, "Authentication required"));
  try {
    request.auth = jwt.verify(token, env.JWT_SECRET);
    next();
  } catch {
    next(new HttpError(401, "Invalid or expired token"));
  }
}
