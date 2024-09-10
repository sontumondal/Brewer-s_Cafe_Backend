class ApiError extends Error {
  constructor(statusCode, message) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true; // Custom property to distinguish operational errors
  }
}

module.exports = { ApiError };
