import { Request, Response } from 'express';
import { InventoryService } from '../domain/services/InventoryService';
const invSvc = new InventoryService();
export class InventoryController {

    /**
     * Récupère le stock central.
     * @param req La requête HTTP.
     * @param res La réponse HTTP.
     */
    static async central(req: Request, res: Response) {
        const central = await invSvc.getCentralStock();
        res.json(central);
    }

    /**
     * Récupère le stock d'un magasin spécifique.
     * @param req La requête HTTP contenant l'ID du magasin.
     * @param res La réponse HTTP.
     */
    static async store(req: Request, res: Response) {
        const storeId = +req.params.storeId;
        const storeStock = await invSvc.getStoreStock(storeId);
        res.json(storeStock);
    }
}