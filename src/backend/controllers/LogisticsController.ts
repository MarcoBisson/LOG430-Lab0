import { Request, Response } from 'express';
import { LogisticsService } from '../domain/services/LogisticsService';
const logisticsService = new LogisticsService();

export class LogisticsController {
    /**
     * Enregistre une demande de réapprovisionnement.
     * @param req La requête HTTP contenant les détails de la demande.
     * @param res La réponse HTTP.
     */
    static async request(req: Request, res: Response) {
        const r = await logisticsService.requestReplenishment(+req.body.storeId, +req.body.productId, +req.body.quantity);
        res.status(201).json(r);
    }

    /**
     * Approuve une demande de réapprovisionnement.
     * @param req La requête HTTP contenant l'ID de la demande à approuver.
     * @param res La réponse HTTP.
     */
    static async approve(req: Request, res: Response) {
        const a = await logisticsService.approveReplenishment(+req.params.id);
        res.json(a);
    }

    /**
     * Alerte les utilisateurs sur les stocks critiques.
     * @param _req La requête HTTP.
     * @param res La réponse HTTP.
     */
    static async alerts(_req: Request, res: Response) {
        const alerts = await logisticsService.checkCriticalStock();
        res.json(alerts);
    }
}