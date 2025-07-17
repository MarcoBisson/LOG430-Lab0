import type { Request, Response, NextFunction } from 'express';
import { errorLogger } from '../utils/logger';

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // Log de l'erreur
  errorLogger.error('Unhandled error', {
    error: err.message,
    stack: err.stack,
    url: req.originalUrl,
    method: req.method,
    body: req.body,
    params: req.params,
    query: req.query
  });

  // Erreur de validation JWT
  if (err.name === 'JsonWebTokenError') {
    res.status(401).json({
      error: 'Token invalide',
      message: 'Le token JWT fourni est invalide'
    });
    return;
  }

  // Token expiré
  if (err.name === 'TokenExpiredError') {
    res.status(401).json({
      error: 'Token expiré',
      message: 'Le token JWT a expiré'
    });
    return;
  }

  // Erreur de syntaxe JSON
  if (err instanceof SyntaxError && 'body' in err) {
    res.status(400).json({
      error: 'JSON invalide',
      message: 'Le format JSON de la requête est invalide'
    });
    return;
  }

  // Erreur par défaut
  res.status(500).json({
    error: 'Erreur interne du serveur',
    message: process.env.NODE_ENV === 'production' 
      ? 'Une erreur interne s\'est produite' 
      : err.message
  });
};
