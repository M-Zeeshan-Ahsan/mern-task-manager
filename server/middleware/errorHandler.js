import { ZodError } from "zod";

const errorHandler = (err, req, res, next) => {
  // Zod Validation Error
  if (err instanceof ZodError) {
    const firstError = err.issues[0];

    let message = firstError.message;

    // Agar required field missing ho
    if (firstError.code === "invalid_type") {
      const field = firstError.path[0];

      message =
        field.charAt(0).toUpperCase() +
        field.slice(1).replace(/([A-Z])/g, " $1") +
        " is required";
    }

    return res.status(400).json({
      success: false,
      message,
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
