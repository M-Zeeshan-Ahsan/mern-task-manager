import { ZodError } from "zod";

const errorHandler = (err, req, res, next) => {
  // Zod Validation Error
  if (err instanceof ZodError) {
    return res.status(400).json({
      success: false,
      message: err.issues[0].message,
      errors: err.issues,
    });
  }

  // Other Errors
  return res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || "Something went wrong, please try again later",
  });
};

export default errorHandler;
