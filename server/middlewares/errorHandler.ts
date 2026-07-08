import { Request, Response, NextFunction } from 'express';
import logger from '../utils/logger';

export interface CustomError extends Error {
  status?: number;
  code?: string;
}

export function errorHandler(err: CustomError, req: Request, res: Response, next: NextFunction) {
  const status = err.status || 500;
  const message = err.message || 'An unexpected error occurred on the server.';
  
  // Log the crash using winston
  logger.error({
    message: err.message,
    status,
    method: req.method,
    url: req.originalUrl,
    stack: err.stack,
  });

  return res.status(status).json({
    error: {
      message,
      status,
      code: err.code || 'INTERNAL_SERVER_ERROR',
      timestamp: new Date().toISOString()
    }
  });
}
