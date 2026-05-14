import { Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';

export const requestLogger = (req: Request, res: Response, next: NextFunction) => {
  // Generate unique request ID
  const requestId = uuidv4();
  req.headers['x-request-id'] = requestId;

  // Log request
  console.log(`[${requestId}] ${req.method} ${req.path} - ${req.ip}`);

  // Override res.json to log response
  const originalJson = res.json;
  res.json = function(data: any) {
    console.log(`[${requestId}] Response ${res.statusCode}: ${JSON.stringify(data)}`);
    return originalJson.call(this, data);
  };

  next();
};
