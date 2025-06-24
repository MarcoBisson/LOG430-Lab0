import { Request, Response } from 'express';
import { ReturnService } from '../../application/services/ReturnService';
import { PrismaSaleRepository } from '../../infrastructure/prisma/PrismaSaleRepository';
import { PrismaStoreRepository } from '../../infrastructure/prisma/PrismaStoreRepository';

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
        await returnService.processReturn(+req.body.saleId);
        res.status(204).end();
    }
}
