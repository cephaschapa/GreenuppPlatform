import winston from "winston";
import path from "path";

// Define log levels
const levels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4,
};

// Define colors for each level
const colors = {
  error: "red",
  warn: "yellow",
  info: "green",
  http: "magenta",
  debug: "white",
};

// Add colors to winston
winston.addColors(colors);

// Define the format for logs
const format = winston.format.combine(
  winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss:ms" }),
  winston.format.colorize({ all: true }),
  winston.format.printf(
    (info) => `${info.timestamp} ${info.level}: ${info.message}`
  )
);

// Define which transports to use based on environment
const transports = [
  // Console transport for all environments
  new winston.transports.Console(),

  // File transport for errors in production
  ...(process.env.NODE_ENV === "production"
    ? [
        new winston.transports.File({
          filename: path.join("logs", "error.log"),
          level: "error",
        }),
        new winston.transports.File({
          filename: path.join("logs", "all.log"),
        }),
      ]
    : []),
];

// Create the logger instance
export const logger = winston.createLogger({
  level: process.env.NODE_ENV === "development" ? "debug" : "info",
  levels,
  format,
  transports,
});

// Create a stream object for Morgan
export const stream = {
  write: (message: string) => {
    logger.http(message.trim());
  },
};

// Export a function to log API requests
export const logApiRequest = (req: any, res: any, next: any) => {
  const start = Date.now();
  res.on("finish", () => {
    const duration = Date.now() - start;
    logger.http(
      `${req.method} ${req.originalUrl} ${res.statusCode} ${duration}ms`
    );
  });
  next();
};

// Export a function to log errors
export const logError = (error: Error, req?: any) => {
  logger.error({
    message: error.message,
    stack: error.stack,
    ...(req && {
      path: req.path,
      method: req.method,
      body: req.body,
      query: req.query,
      params: req.params,
    }),
  });
};
