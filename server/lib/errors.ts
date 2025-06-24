import { Request, Response, NextFunction } from "express";

// Base error class for our application
export class AppError extends Error {
  constructor(public message: string) {
    super(message);
    Object.setPrototypeOf(this, AppError.prototype);
  }
}

// Specific error types
export class ValidationError extends AppError {
  constructor(message: string) {
    super(message);
  }
}

export class AuthenticationError extends AppError {
  constructor(message = "Authentication failed") {
    super(message);
  }
}

export class AuthorizationError extends AppError {
  constructor(message = "Not authorized to perform this action") {
    super(message);
  }
}

export class NotFoundError extends AppError {
  constructor(message = "Resource not found") {
    super(message);
  }
}

export class DatabaseError extends AppError {
  constructor(message = "Database operation failed") {
    super(message);
  }
}

// Error handler middleware
export const errorHandler = (
  err: Error | AppError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // Default to 500 if not an AppError
  const statusCode = err instanceof AppError ? 500 : 500;
  const message = err.message || "Internal Server Error";

  // Log error details
  console.error("Error:", {
    statusCode,
    message,
    stack: err.stack,
    path: req.path,
    method: req.method,
    timestamp: new Date().toISOString(),
  });

  // Send response
  res.status(statusCode).json({
    status: "error",
    message,
    ...(process.env.NODE_ENV === "development" && {
      stack: err.stack,
    }),
  });
};
