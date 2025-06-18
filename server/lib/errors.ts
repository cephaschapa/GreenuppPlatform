import { Request, Response, NextFunction } from "express";

// Base error class for our application
export class AppError extends Error {
  constructor(
    public statusCode: number,
    public message: string,
    public isOperational = true,
    public details?: any
  ) {
    super(message);
    Object.setPrototypeOf(this, AppError.prototype);
  }
}

// Specific error types
export class ValidationError extends AppError {
  constructor(message: string, details?: any) {
    super(400, message, true, details);
  }
}

export class AuthenticationError extends AppError {
  constructor(message = "Authentication failed") {
    super(401, message, true);
  }
}

export class AuthorizationError extends AppError {
  constructor(message = "Not authorized to perform this action") {
    super(403, message, true);
  }
}

export class NotFoundError extends AppError {
  constructor(message = "Resource not found") {
    super(404, message, true);
  }
}

export class DatabaseError extends AppError {
  constructor(message = "Database operation failed", details?: any) {
    super(500, message, false, details);
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
  const statusCode = err instanceof AppError ? err.statusCode : 500;
  const message = err.message || "Internal Server Error";
  const isOperational = err instanceof AppError ? err.isOperational : false;
  const details = err instanceof AppError ? err.details : undefined;

  // Log error details
  console.error("Error:", {
    statusCode,
    message,
    isOperational,
    details,
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
      details,
      stack: err.stack,
    }),
  });

  // In development, throw the error for debugging
  if (process.env.NODE_ENV === "development" && !isOperational) {
    throw err;
  }
};
