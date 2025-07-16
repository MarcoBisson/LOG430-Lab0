import type { Request, Response } from 'express';
import { ReturnService } from '../../application/services/ReturnService';
import { PrismaSaleRepository } from '../../infrastructure/prisma/PrismaSaleRepository';
import { PrismaStoreRepository } from '../../infrastructure/prisma/PrismaStoreRepository';
import { errorResponse } from '../../utils/errorResponse';
import { createControllerLogger } from '../../utils/logger';

const saleRepository = new PrismaSaleRepository();
const storeRepository = new PrismaStoreRepository();
const returnService = new ReturnService(saleRepository, storeRepository);
const log = createControllerLogger('ReturnController');
export class ReturnController {
    /**
     * Enregistre un retour de produit dans le système.
     * @param req La requête HTTP contenant les détails du retour.
     * @param res La réponse HTTP.
     */
    static async process(req: Request, res: Response) {
        try {
            const sale = await saleRepository.getSaleById(+req.body.saleId);
            if (!sale) {
                log.warn(`SaleID ${req.body.saleId} not found`);
                errorResponse(res, 404, 'Not Found', 'Ventes introuvable', req.originalUrl);
                return;
            }

            log.info(`getSaleById ${sale.id} successfull`);
            await returnService.processReturn(sale.id);
            log.info(`processReturn for ${sale.id} successfull`);
            res.status(204).end();
        } catch (err: any) {
            log.error('Error found', {message: err.message});
            errorResponse(res, 400, 'Bad Request', `Erreur processus de retour pour saleId ${req.body.saleId}`, req.originalUrl);
        }
    }
}
