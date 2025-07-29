import type { Response, NextFunction } from 'express';
import type { AuthenticatedRequest } from './authentificateJWT';
import { errorResponse } from '../utils/errorResponse';
import { createControllerLogger } from '../utils/logger';

const logger = createControllerLogger('AuthorizeMiddleware');

export const authorize = (allowedRoles: string[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const user = req.user as any;
    
    if (!user) {
      logger.warn('Authorization failed: No user in request');
      errorResponse(res, 401, 'Unauthorized', 'Utilisateur non authentifié', req.originalUrl || '');
      return;
    }

    if (!allowedRoles.includes(user.role)) {
      logger.warn(`Authorization failed: User ${user.id} with role ${user.role} tried to access resource requiring roles: ${allowedRoles.join(', ')}`);
      errorResponse(res, 403, 'Forbidden', 'Accès interdit: rôle insuffisant', req.originalUrl || '');
      return;
    }

    logger.info(`Authorization successful: User ${user.id} with role ${user.role} accessing resource`);
    next();
  };
};
