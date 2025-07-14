import type { Request, Response } from 'express';
import { SaleService } from '../../application/services/SaleService';
import { PrismaSaleRepository } from '../../infrastructure/prisma/PrismaSaleRepository';
import { PrismaStoreRepository } from '../../infrastructure/prisma/PrismaStoreRepository';
import { errorResponse } from '../../utils/errorResponse';

const saleRepository = new PrismaSaleRepository();
const storeRepository = new PrismaStoreRepository();
const saleService = new SaleService(saleRepository, storeRepository);

export class SaleController {
    /**
     * Enregistre une vente dans le système.
     * @param req La requête HTTP contenant les détails de la vente.
     * @param res La réponse HTTP.
     */
    static async record(req: Request, res: Response) {
        try {
            const sale = await saleService.recordSale(+req.body.storeId, req.body.items);
            res.status(201).json(sale);
        } catch {
            errorResponse(res, 400, 'Bad Request', "Erreur lors de l'enregistrement de la vente", req.originalUrl);
        }
    }

    /**
     * Récupère une vente par son ID.
     * @param req La requête HTTP contenant l'ID de la vente.
     * @param res La réponse HTTP.
     */
    static async get(req: Request, res: Response) {
        const s = await saleService.getSaleById(+req.params.id);
        if (s) {
            res.json(s);
        } else {
            errorResponse(res, 404, 'Not Found', 'Vente non trouvée', req.originalUrl);
        }
    }
}
