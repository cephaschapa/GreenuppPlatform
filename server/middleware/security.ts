import { Request, Response, NextFunction } from "express";
import { logger } from "../lib/logger.js";

// Extend Express Request interface to include clientIP
declare global {
  namespace Express {
    interface Request {
      clientIP?: string;
    }
  }
}

// Rate limiting configuration (simplified without external packages for now)
export const createRateLimiters = () => {
  // Simple in-memory rate limiting (in production, use Redis)
  const rateLimitStore = new Map<
    string,
    { count: number; resetTime: number }
  >();

  const createLimiter = (
    windowMs: number,
    max: number,
    keyGenerator?: (req: Request) => string
  ) => {
    return (req: Request, res: Response, next: NextFunction) => {
      const key = keyGenerator
        ? keyGenerator(req)
        : req.clientIP || req.ip || "unknown";
      const now = Date.now();

      const record = rateLimitStore.get(key);
      if (!record || now > record.resetTime) {
        rateLimitStore.set(key, { count: 1, resetTime: now + windowMs });
        return next();
      }

      if (record.count >= max) {
        const timeUntilReset = Math.ceil((record.resetTime - now) / 1000 / 60); // minutes
        logger.warn(
          `Rate limit exceeded for IP: ${key}, resets in ${timeUntilReset} minutes`
        );
        return res.status(429).json({
          error: `Too many requests, please try again in ${timeUntilReset} minute(s).`,
          retryAfter: timeUntilReset,
        });
      }

      record.count++;
      next();
    };
  };

  // Configurable rate limits with environment variables
  const isDevelopment = process.env.NODE_ENV !== "production";

  // Allow environment variable overrides for rate limits
  const generalLimit = parseInt(
    process.env.RATE_LIMIT_GENERAL || (isDevelopment ? "1000" : "500")
  );
  const authLimit = parseInt(
    process.env.RATE_LIMIT_AUTH || (isDevelopment ? "50" : "30")
  );
  const passwordResetLimit = parseInt(
    process.env.RATE_LIMIT_PASSWORD_RESET || (isDevelopment ? "20" : "5")
  );

  return {
    generalLimiter: createLimiter(15 * 60 * 1000, generalLimit), // 15 min window
    authLimiter: createLimiter(15 * 60 * 1000, authLimit), // 15 min window
    passwordResetLimiter: createLimiter(60 * 60 * 1000, passwordResetLimit), // 1 hour window
    rateLimitStore, // Expose store for clearing if needed
  };
};

// CORS configuration (simplified)
export const corsOptions = {
  origin: function (origin: string | undefined, callback: Function) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);

    const allowedOrigins = [
      process.env.FRONTEND_URL,
      process.env.APP_SUBDOMAIN_URL,
      "http://localhost:3000",
      "http://localhost:5173",
      "https://greenupp.app",
      "https://app.greenupp.app",
    ].filter(Boolean);

    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      logger.warn(`CORS blocked request from origin: ${origin}`);
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
  optionsSuccessStatus: 200,
};

// Security headers middleware (simplified without helmet)
export const securityHeaders = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // Basic security headers
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "DENY");
  res.setHeader("X-XSS-Protection", "1; mode=block");
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  res.setHeader(
    "Permissions-Policy",
    "geolocation=*, microphone=(), camera=()"
  );

  next();
};

// IP address extraction middleware
export const extractClientIP = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // Check for forwarded headers (when behind proxy)
  const forwardedFor = req.headers["x-forwarded-for"];
  const realIP = req.headers["x-real-ip"];

  if (forwardedFor) {
    // X-Forwarded-For can contain multiple IPs, take the first one
    req.clientIP = Array.isArray(forwardedFor)
      ? forwardedFor[0].split(",")[0].trim()
      : forwardedFor.split(",")[0].trim();
  } else if (realIP) {
    req.clientIP = Array.isArray(realIP) ? realIP[0] : realIP;
  } else {
    req.clientIP =
      req.connection.remoteAddress || req.socket.remoteAddress || "unknown";
  }

  // Remove IPv6 prefix if present
  if (req.clientIP && req.clientIP.startsWith("::ffff:")) {
    req.clientIP = req.clientIP.substring(7);
  }

  next();
};

// Request logging middleware
export const requestLogger = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const start = Date.now();

  res.on("finish", () => {
    const duration = Date.now() - start;
    const logLevel = res.statusCode >= 400 ? "warn" : "info";

    logger[logLevel](
      `${req.method} ${req.originalUrl} ${res.statusCode} ${duration}ms - ${
        req.clientIP || req.ip
      }`
    );
  });

  next();
};

// Security event logging middleware
export const securityEventLogger = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // Log suspicious activities
  const suspiciousPatterns = [
    /\.\./, // Directory traversal
    /<script/i, // XSS attempts
    /union.*select/i, // SQL injection attempts
    /eval\(/i, // Code injection attempts
  ];

  const url = req.originalUrl.toLowerCase();
  const userAgent = req.headers["user-agent"] || "";

  for (const pattern of suspiciousPatterns) {
    if (pattern.test(url) || pattern.test(userAgent)) {
      logger.warn(
        `Suspicious activity detected: ${req.method} ${req.originalUrl} from ${
          req.clientIP || req.ip
        }`
      );
      break;
    }
  }

  next();
};

// Input sanitization middleware
export const sanitizeInput = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // Basic input sanitization
  const sanitize = (obj: any): any => {
    if (typeof obj === "string") {
      return obj
        .replace(/[<>]/g, "") // Remove potential HTML tags
        .trim();
    }
    if (typeof obj === "object" && obj !== null) {
      const sanitized: any = Array.isArray(obj) ? [] : {};
      for (const key in obj) {
        sanitized[key] = sanitize(obj[key]);
      }
      return sanitized;
    }
    return obj;
  };

  req.body = sanitize(req.body);
  req.query = sanitize(req.query);
  req.params = sanitize(req.params);

  next();
};

// Session security middleware
export const sessionSecurity = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // Regenerate session ID on authentication state change
  if (req.session && req.sessionID) {
    const isAuthenticated = req.isAuthenticated && req.isAuthenticated();
    const wasAuthenticated = (req.session as any).wasAuthenticated;

    if (isAuthenticated !== wasAuthenticated) {
      (req.session as any).wasAuthenticated = isAuthenticated;
      if (isAuthenticated) {
        // Regenerate session ID after successful login
        req.session.regenerate((err) => {
          if (err) {
            logger.error("Session regeneration error:", err);
          }
          next();
        });
        return;
      }
    }
  }

  next();
};

// Export all middleware as a single function for easy setup
export const setupSecurityMiddleware = (app: any) => {
  const { generalLimiter, authLimiter, passwordResetLimiter, rateLimitStore } =
    createRateLimiters();

  // Basic security headers
  app.use(securityHeaders);

  // IP extraction
  app.use(extractClientIP);

  // Request logging
  app.use(requestLogger);

  // Security event logging
  app.use(securityEventLogger);

  // Input sanitization
  app.use(sanitizeInput);

  // Session security
  app.use(sessionSecurity);

  // Rate limiting
  app.use("/api/auth", authLimiter);
  app.use("/api/auth/forgot-password", passwordResetLimiter);
  app.use("/api/auth/reset-password", passwordResetLimiter);
  app.use("/api", generalLimiter);

  // Development endpoint to clear rate limits
  if (process.env.NODE_ENV !== "production") {
    app.post("/api/dev/clear-rate-limits", (req: any, res: any) => {
      rateLimitStore.clear();
      logger.info("Rate limits cleared for development");
      res.json({ message: "Rate limits cleared" });
    });
  }

  // Admin endpoint to clear rate limits (with authentication)
  app.post("/api/admin/clear-rate-limits", (req: any, res: any) => {
    // Check if user is admin
    if (!req.user || req.user.role !== "admin") {
      return res.status(403).json({ error: "Admin access required" });
    }

    rateLimitStore.clear();
    logger.info(`Rate limits cleared by admin user: ${req.user.id}`);
    res.json({ message: "Rate limits cleared successfully" });
  });

  return { generalLimiter, authLimiter, passwordResetLimiter, rateLimitStore };
};
