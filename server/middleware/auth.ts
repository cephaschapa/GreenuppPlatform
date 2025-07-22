import { Request, Response, NextFunction } from "express";

/**
 * Middleware to check if user is authenticated
 */
export function isAuthenticated(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  // Check for regular Passport authentication
  if (req.isAuthenticated && req.isAuthenticated()) {
    return next();
  }

  // Check for admin session authentication
  if (req.session && req.session.userId && req.session.user) {
    return next();
  }

  res.status(401).json({ message: "Not authenticated" });
}

/**
 * Middleware to check if user has a specific role
 */
export function hasRole(role: string) {
  return (req: Request, res: Response, next: NextFunction): void => {
    // Check for regular Passport authentication
    if (
      req.isAuthenticated &&
      req.isAuthenticated() &&
      req.user &&
      req.user.role === role
    ) {
      return next();
    }

    // Check for admin session authentication
    if (
      req.session &&
      req.session.userId &&
      req.session.user &&
      req.session.user.role === role
    ) {
      return next();
    }

    res.status(403).json({ message: "Unauthorized access" });
  };
}

/**
 * Middleware to check if user is a farmer
 */
export function isFarmer(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  return hasRole("farmer")(req, res, next);
}

/**
 * Middleware to check if user is authenticated and has user object
 */
export function isAuthenticatedWithUser(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  if (req.isAuthenticated && req.isAuthenticated() && req.user) {
    return next();
  }
  res.status(401).json({ message: "Not authenticated" });
}
