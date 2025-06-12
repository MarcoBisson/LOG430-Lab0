import { Request, Response } from 'express';
import { InventoryService } from '../../application/services/InventoryService';
import { PrismaStoreRepository } from '../../infrastructure/prisma/PrismaStoreRepository';
import { PrismaLogisticsRepository } from '../../infrastructure/prisma/PrismaLogisticsRepository';

const logisticsRepository = new PrismaLogisticsRepository();
const storeRepository = new PrismaStoreRepository();
const inventoryService = new InventoryService(logisticsRepository, storeRepository);

export class InventoryController {
    /**
     * Récupère le stock central.
     * @param req La requête HTTP.
     * @param res La réponse HTTP.
     */
    static async central(req: Request, res: Response) {
        const central = await inventoryService.getCentralStock();
        res.json(central);
    }

    /**
     * Récupère le stock d'un magasin spécifique.
     * @param req La requête HTTP contenant l'ID du magasin.
     * @param res La réponse HTTP.
     */
    static async store(req: Request, res: Response) {
        const storeId = +req.params.storeId;
        const storeStock = await inventoryService.getStoreStock(storeId);
        res.json(storeStock);
    }
}