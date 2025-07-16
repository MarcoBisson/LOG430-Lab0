import type { Request, Response } from 'express';
import { SaleService } from '../../application/services/SaleService';
import { PrismaSaleRepository } from '../../infrastructure/prisma/PrismaSaleRepository';
import { PrismaStoreRepository } from '../../infrastructure/prisma/PrismaStoreRepository';
import { errorResponse } from '../../utils/errorResponse';
import { createControllerLogger } from '../../utils/logger';

const saleRepository = new PrismaSaleRepository();
const storeRepository = new PrismaStoreRepository();
const saleService = new SaleService(saleRepository, storeRepository);
const log = createControllerLogger('SaleController');

export class SaleController {
    /**
     * Enregistre une vente dans le système.
     * @param req La requête HTTP contenant les détails de la vente.
     * @param res La réponse HTTP.
     */
    static async record(req: Request, res: Response) {
        try {
            const sale = await saleService.recordSale(+req.body.storeId, req.body.items);
            log.info(`record sale ${sale.id} successful`, { sale });
            res.status(201).json(sale);
        } catch (err: any) {
            log.error('Error recording sale', { message: err.message, storeId: req.body.storeId });
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
            log.info('getSaleById successful', { saleId: req.params.id, sale: s });
            res.json(s);
        } else {
            log.warn(`getSaleById failed, saleId ${req.params.id} not found`);
            errorResponse(res, 404, 'Not Found', 'Vente non trouvée', req.originalUrl);
        }
    }
}
