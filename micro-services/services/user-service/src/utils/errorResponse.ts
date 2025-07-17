import type { Response } from 'express';
import { errorLogger } from './logger';

export const errorResponse = (
  res: Response, 
  statusCode: number, 
  error: string, 
  message: string, 
  path: string,
  details?: any
) => {
  const errorData = {
    error,
    message,
    path,
    timestamp: new Date().toISOString(),
    details
  };

  // Log de l'erreur
  errorLogger.error('Error response sent', errorData);

  return res.status(statusCode).json(errorData);
};
