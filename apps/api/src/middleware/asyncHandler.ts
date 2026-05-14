import { Request, Response, NextFunction } from 'express';

/**
 * Async error handler wrapper for Express routes
 * Catches errors from async route handlers and passes them to Express error middleware
 */
export const asyncHandler = (fn: (req: Request, res: Response, next: NextFunction) => Promise<any>) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};
