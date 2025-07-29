import type { Request, Response } from 'express';
import { AuthService } from '../services/AuthService';
import { PrismaUserRepository } from '../repositories/PrismaUserRepository';
import { errorResponse } from '../utils/errorResponse';
import { createControllerLogger } from '../utils/logger';

const userRepository = new PrismaUserRepository();
const log = createControllerLogger('AuthController');

export class AuthController {
  static async login(req: Request, res: Response) {
    const { username, password } = req.body;
    console.log(username)
    const user = await userRepository.getUser(username);

    if (!user || !(await AuthService.comparePassword(password, user.password))) {
        log.warn(`User ${username} not found`);
        errorResponse(res, 401, 'Unauthorized', 'Invalid credentials', req.originalUrl);
    } else {
        log.info(`User ${username} found. Generate token for ${username}`,{id: user.id, username: user.username, role: user.role});
        const token = AuthService.generateToken({ id: user.id, role: user.role });
        res.json({ 
            user : {id: user.id, role: user.role},
            token, 
          });
    }
  }

  static async logout(req: Request, res: Response) {
    try {
      // Dans un vrai système, nous ajouterions le token à une blacklist
      // ou révoquions la session en base de données
      log.info('User logged out successfully');
      res.json({ 
        message: 'Déconnexion réussie' 
      });
    } catch (error) {
      log.error('Logout failed', error);
      errorResponse(res, 500, 'Internal Server Error', 'Erreur lors de la déconnexion', req.originalUrl);
    }
  }

  static async refreshToken(req: Request, res: Response) {
    try {
      const authHeader = req.headers.authorization;
      
      if (!authHeader?.startsWith('Bearer ')) {
        errorResponse(res, 401, 'Unauthorized', 'Token manquant', req.originalUrl);
        return;
      }

      const token = authHeader.split(' ')[1];
      const decoded = AuthService.verifyToken(token) as any;
      
      // Générer un nouveau token
      const newToken = AuthService.generateToken({ 
        id: decoded.id, 
        role: decoded.role 
      });
      
      log.info(`Token refreshed for user ${decoded.id}`);
      res.json({ token: newToken });
      
    } catch (error) {
      log.error('Token refresh failed', error);
      errorResponse(res, 401, 'Unauthorized', 'Token invalide ou expiré', req.originalUrl);
    }
  }
}
