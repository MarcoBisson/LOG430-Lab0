import type { Response } from 'express';
import { InventoryService } from '../../application/services/InventoryService';
import { PrismaStoreRepository } from '../../infrastructure/prisma/PrismaStoreRepository';
import { PrismaLogisticsRepository } from '../../infrastructure/prisma/PrismaLogisticsRepository';
import type { AuthenticatedRequest } from '../middlewares/authentificateJWT';
import { UserRole } from '@prisma/client';
import { PrismaUserRepository } from '../../infrastructure/prisma/PrismaUserRepository';
import { errorResponse } from '../../utils/errorResponse';
import { createControllerLogger } from '../../utils/logger';

const logisticsRepository = new PrismaLogisticsRepository();
const storeRepository = new PrismaStoreRepository();
const userRepository = new PrismaUserRepository();
const inventoryService = new InventoryService(logisticsRepository, storeRepository);
const log = createControllerLogger('InventoryController');
export class InventoryController {
    /**
     * Récupère le stock central.
     * @param req La requête HTTP.
     * @param res La réponse HTTP.
     */
    static async central(req: AuthenticatedRequest, res: Response) {
        if (req.user && req.user.role !== UserRole.CLIENT) {
            const query = req.query || {};
            const page = query.page ? parseInt(query.page as string) : undefined;
            const limit = query.limit ? parseInt(query.limit as string) : undefined;
            const { products, total } = await inventoryService.getCentralStock(page, limit);
            log.info('GetCentralStock successfull', { products: products.length, total, page, limit });
            res.json({ products, total });
        } else {
            log.warn(`Access Unauthorized for ${req.user?.username} (${req.user?.role})`);
            errorResponse(res, 401, 'Unauthorized', 'Acces Unauthorized', req.originalUrl);
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
                log.info(`GetStoreStock for store ${storeId} successfull`, {storeStock});
                res.json(storeStock);
            } else {
                log.warn(`Access Unauthorized for ${req.user.username} (${req.user.role})`);
                errorResponse(res, 401, 'Unauthorized', 'Acces Unauthorized', req.originalUrl);
            }
        } else {
            log.warn('Invalid token');
            errorResponse(res, 403, 'Forbidden', 'Invalid token', req.originalUrl);
        }
    }
}
