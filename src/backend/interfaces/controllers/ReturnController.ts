import type { Request, Response } from 'express';
import { ReturnService } from '../../application/services/ReturnService';
import { PrismaSaleRepository } from '../../infrastructure/prisma/PrismaSaleRepository';
import { PrismaStoreRepository } from '../../infrastructure/prisma/PrismaStoreRepository';
import { errorResponse } from '../../utils/errorResponse';

const saleRepository = new PrismaSaleRepository();
const storeRepository = new PrismaStoreRepository();
const returnService = new ReturnService(saleRepository, storeRepository);

export class ReturnController {
    /**
     * Enregistre un retour de produit dans le système.
     * @param req La requête HTTP contenant les détails du retour.
     * @param res La réponse HTTP.
     */
    static async process(req: Request, res: Response) {
        const sale = await saleRepository.getSaleById(+req.body.saleId);
        if (!sale) {
            errorResponse(res, 404, 'Not Found', 'Ventes introuvable', req.originalUrl);
        }

        await returnService.processReturn(sale?.id ?? +req.body.saleId);
        res.status(204).end();
    }
}
