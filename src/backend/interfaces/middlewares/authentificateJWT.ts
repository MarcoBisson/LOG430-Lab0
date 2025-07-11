import type { Request, Response, NextFunction } from 'express';
import { AuthService } from '../../application/services/AuthService';
import type { User } from '@prisma/client';

export interface AuthenticatedRequest extends Request {
  user?: User;
}

export function authenticateJWT(req: AuthenticatedRequest, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;

  if (authHeader?.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];

    try {
      const decoded = AuthService.verifyToken(token);
      (req as any).user = decoded;
      if (!req.user)
        throw new Error('User not found in token');
      next();
    } catch {
      res.status(403).json({ error: 'Invalid token' });
    }
  } else {
    res.status(401).json({ error: 'Token required' });
  }

  
}
