import { Response } from 'express';
import { ApiResponse } from '@nextgenoutreach/types';

export function ok(res: Response, data: unknown, meta?: object) {
  return res.status(200).json({ 
    success: true, 
    data, 
    meta: {
      requestId: generateRequestId(),
      ...meta
    }
  } as ApiResponse);
}

export function created(res: Response, data: unknown) {
  return res.status(201).json({ 
    success: true, 
    data,
    meta: {
      requestId: generateRequestId()
    }
  } as ApiResponse);
}

export function badRequest(res: Response, message: string, code?: string) {
  return res.status(400).json({ 
    success: false, 
    error: { 
      code: code || 'BAD_REQUEST', 
      message, 
      statusCode: 400 
    },
    meta: {
      requestId: generateRequestId()
    }
  } as ApiResponse);
}

export function unauthorized(res: Response, message = 'Unauthorised') {
  return res.status(401).json({ 
    success: false, 
    error: { 
      code: 'UNAUTHORIZED', 
      message, 
      statusCode: 401 
    },
    meta: {
      requestId: generateRequestId()
    }
  } as ApiResponse);
}

export function forbidden(res: Response, message = 'Forbidden') {
  return res.status(403).json({ 
    success: false, 
    error: { 
      code: 'FORBIDDEN', 
      message, 
      statusCode: 403 
    },
    meta: {
      requestId: generateRequestId()
    }
  } as ApiResponse);
}

export function notFound(res: Response, message = 'Not found') {
  return res.status(404).json({ 
    success: false, 
    error: { 
      code: 'NOT_FOUND', 
      message, 
      statusCode: 404 
    },
    meta: {
      requestId: generateRequestId()
    }
  } as ApiResponse);
}

export function serverError(res: Response, message = 'Internal server error') {
  return res.status(500).json({ 
    success: false, 
    error: { 
      code: 'SERVER_ERROR', 
      message, 
      statusCode: 500 
    },
    meta: {
      requestId: generateRequestId()
    }
  } as ApiResponse);
}

function generateRequestId(): string {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}
