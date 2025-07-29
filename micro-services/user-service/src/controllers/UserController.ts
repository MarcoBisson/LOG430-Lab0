import type { Request, Response } from 'express';
import { AuthService } from '../services/AuthService';
import { PrismaUserRepository } from '../repositories/PrismaUserRepository';
import { errorResponse } from '../utils/errorResponse';
import { createControllerLogger } from '../utils/logger';
import type { AuthenticatedRequest } from '../middlewares/authentificateJWT';

const userRepository = new PrismaUserRepository();
const log = createControllerLogger('UserController');

export class UserController {
  static async getProfile(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = (req.user as any)?.id;
      
      if (!userId) {
        errorResponse(res, 401, 'Unauthorized', 'Utilisateur non authentifié', req.originalUrl);
        return
      }

      const user = await userRepository.getUserById(userId);
      
      if (!user) {
        errorResponse(res, 404, 'Not Found', 'Utilisateur non trouvé', req.originalUrl);
        return;
      }

      // Ne pas retourner le mot de passe
      const { password, ...userProfile } = user;
      
      log.info(`Profile retrieved for user ${userId}`);
      res.json(userProfile);
      
    } catch (error) {
      log.error('Get profile failed', error);
      errorResponse(res, 500, 'Internal Server Error', 'Erreur lors de la récupération du profil', req.originalUrl);
    }
  }

  static async getAllUsers(req: Request, res: Response) {
    try {
      const users = await userRepository.getAllUsers();
      
      // Ne pas retourner les mots de passe
      const usersWithoutPasswords = users.map(({ password, ...user }) => user);
      
      log.info(`Retrieved ${users.length} users`);
      res.json(usersWithoutPasswords);
      
    } catch (error) {
      log.error('Get all users failed', error);
      errorResponse(res, 500, 'Internal Server Error', 'Erreur lors de la récupération des utilisateurs', req.originalUrl);
    }
  }

  static async createUser(req: Request, res: Response) {
    try {
      const { username, email, password, role, storeId } = req.body;
      
      // Vérifier si l'utilisateur existe déjà
      const existingUser = await userRepository.getUser(username);
      if (existingUser) {
        errorResponse(res, 400, 'Bad Request', 'Un utilisateur avec ce nom existe déjà', req.originalUrl);
        return;
      }

      // Hasher le mot de passe
      const hashedPassword = await AuthService.hashPassword(password);
      
      // Créer l'utilisateur
      const newUser = await userRepository.createUser({
        username,
        email,
        password: hashedPassword,
        role,
        storeId: storeId || null
      });

      // Ne pas retourner le mot de passe
      const { password: _, ...userResponse } = newUser;
      
      log.info(`User created: ${username}`);
      res.status(201).json(userResponse);
      
    } catch (error) {
      log.error('Create user failed', error);
      errorResponse(res, 500, 'Internal Server Error', 'Erreur lors de la création de l\'utilisateur', req.originalUrl);
    }
  }

  static async updateUser(req: Request, res: Response) {
    try {
      const userId = parseInt(req.params.id);
      const updates = req.body;
      
      // Si on met à jour le mot de passe, le hasher
      if (updates.password) {
        updates.password = await AuthService.hashPassword(updates.password);
      }
      
      const updatedUser = await userRepository.updateUser(userId, updates);
      
      if (!updatedUser) {
        errorResponse(res, 404, 'Not Found', 'Utilisateur non trouvé', req.originalUrl);
        return;
      }

      // Ne pas retourner le mot de passe
      const { password, ...userResponse } = updatedUser;
      
      log.info(`User updated: ${userId}`);
      res.json(userResponse);
      
    } catch (error) {
      log.error('Update user failed', error);
      errorResponse(res, 500, 'Internal Server Error', 'Erreur lors de la mise à jour de l\'utilisateur', req.originalUrl);
    }
  }

  static async deleteUser(req: Request, res: Response) {
    try {
      const userId = parseInt(req.params.id);
      
      const deletedUser = await userRepository.deleteUser(userId);
      
      if (!deletedUser) {
        errorResponse(res, 404, 'Not Found', 'Utilisateur non trouvé', req.originalUrl);
        return;
      }
      
      log.info(`User deleted: ${userId}`);
      res.json({ message: 'Utilisateur supprimé avec succès' });
      
    } catch (error) {
      log.error('Delete user failed', error);
      errorResponse(res, 500, 'Internal Server Error', 'Erreur lors de la suppression de l\'utilisateur', req.originalUrl);
    }
  }

  static async getUserAccess(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = (req.user as any)?.id;
      
      if (!userId) {
        errorResponse(res, 401, 'Unauthorized', 'Utilisateur non authentifié', req.originalUrl || '');
        return;
      }

      const stores = await userRepository.getUserAccess(userId);
      
      log.info(`Access retrieved for user ${userId}: ${stores.length} store(s)`);
      res.json(stores);
      
    } catch (error) {
      log.error('Get user access failed', error);
      errorResponse(res, 500, 'Internal Server Error', 'Erreur lors de la récupération des accès', req.originalUrl || '');
    }
  }

  static async addStoreAccess(req: Request, res: Response) {
    try {
      const userId = parseInt(req.params.id);
      const { storeId } = req.body;
      
      if (!storeId) {
        errorResponse(res, 400, 'Bad Request', 'storeId est requis', req.originalUrl);
        return;
      }
      
      const success = await userRepository.addStoreAccessToStaff(userId, storeId);
      
      if (!success) {
        errorResponse(res, 400, 'Bad Request', 'Impossible d\'ajouter l\'accès (utilisateur non trouvé ou pas un staff)', req.originalUrl);
        return;
      }
      
      log.info(`Store access added: User ${userId} -> Store ${storeId}`);
      res.json({ message: 'Accès magasin ajouté avec succès' });
      
    } catch (error) {
      log.error('Add store access failed', error);
      errorResponse(res, 500, 'Internal Server Error', 'Erreur lors de l\'ajout de l\'accès', req.originalUrl);
    }
  }

  static async removeStoreAccess(req: Request, res: Response) {
    try {
      const userId = parseInt(req.params.id);
      const storeId = parseInt(req.params.storeId);
      
      const success = await userRepository.removeStoreAccessFromStaff(userId, storeId);
      
      if (!success) {
        errorResponse(res, 400, 'Bad Request', 'Impossible de supprimer l\'accès (utilisateur non trouvé ou pas un staff)', req.originalUrl);
        return;
      }
      
      log.info(`Store access removed: User ${userId} -> Store ${storeId}`);
      res.json({ message: 'Accès magasin supprimé avec succès' });
      
    } catch (error) {
      log.error('Remove store access failed', error);
      errorResponse(res, 500, 'Internal Server Error', 'Erreur lors de la suppression de l\'accès', req.originalUrl);
    }
  }

  static async setStoreAccess(req: Request, res: Response) {
    try {
      const userId = parseInt(req.params.id);
      const { storeIds } = req.body;
      
      if (!Array.isArray(storeIds)) {
        errorResponse(res, 400, 'Bad Request', 'storeIds doit être un tableau', req.originalUrl);
        return;
      }
      
      const success = await userRepository.setStoreAccessForStaff(userId, storeIds);
      
      if (!success) {
        errorResponse(res, 400, 'Bad Request', 'Impossible de définir les accès (utilisateur non trouvé ou pas un staff)', req.originalUrl);
        return;
      }
      
      log.info(`Store access set: User ${userId} -> Stores [${storeIds.join(', ')}]`);
      res.json({ message: 'Accès magasins définis avec succès' });
      
    } catch (error) {
      log.error('Set store access failed', error);
      errorResponse(res, 500, 'Internal Server Error', 'Erreur lors de la définition des accès', req.originalUrl);
    }
  }
}
