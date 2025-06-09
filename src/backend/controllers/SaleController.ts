import { Request, Response } from 'express';
import { SaleService } from '../domain/services/SaleService';
const saleService = new SaleService();

export class SaleController {
    /**
     * Enregistre une vente dans le système.
     * @param req La requête HTTP contenant les détails de la vente.
     * @param res La réponse HTTP.
     */
    static async record(req: Request, res: Response) {
        const sale = await saleService.recordSale(+req.body.storeId, req.body.items);
        res.status(201).json(sale);
    }

    /**
     * Récupère une vente par son ID.
     * @param req La requête HTTP contenant l'ID de la vente.
     * @param res La réponse HTTP.
     */
    static async get(req: Request, res: Response) {
        const s = await saleService.getSaleById(+req.params.id);
        s ? res.json(s) : res.status(404).json({ error: 'Not found' });
    }
}
