import { Request, Response } from 'express';
import { ReturnService } from '../domain/services/ReturnService';
import { PrismaRepository } from '../infrastructure/PrismaRepository';
const returnService = new ReturnService(new PrismaRepository());

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
