class ApiError extends Error {
  constructor(statusCode, message) {
    super(message);
    this.statusCode = statusCode;
    this.success = false;
    // Error.captureStackTrace() kya hai?
    // Ye current error ki stack trace ko clean banata hai. Isse stack ApiError constructor se nahi, balki jis line par tumne throw new ApiError(...) likha hai wahan se start hoti hai. Ye debugging ko aur achha bana deta hai.
    Error.captureStackTrace(this, this.constructor);
  }
}
export default ApiError;
