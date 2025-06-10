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
        try {
            const { storeId, productId, quantity } = req.body;
            const result = await logisticsService.requestReplenishment(+storeId, +productId, +quantity);
            return res.status(201).json(result);
        } catch (err: any) {
            return res.status(400).json({ error: err.message });
        }
    }

    /**
     * Approuve une demande de réapprovisionnement.
     * @param req La requête HTTP contenant l'ID de la demande à approuver.
     * @param res La réponse HTTP.
     */
    static async approve(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const result = await logisticsService.approveReplenishment(+id);
            return res.json(result);
        } catch (err: any) {
            return res.status(400).json({ error: err.message });
        }
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