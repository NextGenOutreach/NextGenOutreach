import { Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { logger } from '../lib/logger';

export const requestLogger = (req: Request, res: Response, next: NextFunction) => {
  const requestId = uuidv4();
  req.headers['x-request-id'] = requestId;

  logger.http(`[${requestId}] ${req.method} ${req.path} - ${req.ip}`);

  res.on('finish', () => {
    logger.http(`[${requestId}] ${res.statusCode} ${req.method} ${req.path}`);
  });

  next();
};
