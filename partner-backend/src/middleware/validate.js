import { HttpError } from "../utils/http-error.js";

export const validate = (schema) => (request, _response, next) => {
  const result = schema.safeParse({
    body: request.body,
    params: request.params,
    query: request.query,
  });

  if (!result.success) {
    console.log("VALIDATION ERROR:");
    console.log(result.error);
    console.log("PARAMS:", request.params);
    console.log("BODY:", request.body);
    console.log("QUERY:", request.query);

    return next(
      new HttpError(
        400,
        "Validation failed",
        result.error.flatten(),
      ),
    );
  }

  request.validated = result.data;
  next();
};