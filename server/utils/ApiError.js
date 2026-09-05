// Lets controllers do `throw new ApiError(404, "User not found")` and have
// middleware/errorHandler.js pick up the right status code automatically.

export class ApiError extends Error {
  constructor(statusCode, message) {
    super(message);
    this.statusCode = statusCode;
    this.name = "ApiError";
  }
}
