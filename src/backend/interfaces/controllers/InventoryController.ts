import type { Response } from 'express';
import { InventoryService } from '../../application/services/InventoryService';
import { PrismaStoreRepository } from '../../infrastructure/prisma/PrismaStoreRepository';
import { PrismaLogisticsRepository } from '../../infrastructure/prisma/PrismaLogisticsRepository';
import type { AuthenticatedRequest } from '../middlewares/authentificateJWT';
import { UserRole } from '@prisma/client';
import { PrismaUserRepository } from '../../infrastructure/prisma/PrismaUserRepository';

const logisticsRepository = new PrismaLogisticsRepository();
const storeRepository = new PrismaStoreRepository();
const userRepository = new PrismaUserRepository();
const inventoryService = new InventoryService(logisticsRepository, storeRepository);

export class InventoryController {
    /**
     * Récupère le stock central.
     * @param req La requête HTTP.
     * @param res La réponse HTTP.
     */
    static async central(req: AuthenticatedRequest, res: Response) {
        if (req.user && req.user.role !== UserRole.CLIENT) {
            const central = await inventoryService.getCentralStock();
            res.json(central);
        } else {
            res.status(401).json({ error: 'Acces Unauthorized' });
        }
    }

    /**
     * Récupère le stock d'un magasin spécifique.
     * @param req La requête HTTP contenant l'ID du magasin.
     * @param res La réponse HTTP.
     */
    static async store(req: AuthenticatedRequest, res: Response) {
        const storeId = +req.params.storeId;

        if (req.user){
            const access = await userRepository.getUserAccess(req.user.id);

            if (access.find( store => store.id === storeId)){
                const storeStock = await inventoryService.getStoreStock(storeId);
                res.json(storeStock);
            } else {
                res.status(401).json({ error: 'Acces Unauthorized' });
            }
        } else {
            res.status(403).json({ error: 'Invalid token' });
        }
    }
}
