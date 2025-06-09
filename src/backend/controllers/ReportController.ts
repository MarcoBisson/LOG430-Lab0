import { Request, Response } from 'express';
import { ReportService } from '../domain/services/ReportService';
const reportService = new ReportService();

export class ReportController {
    /**
     * Récupère un rapport consolidé des ventes, produits et stocks.
     * @param req La requête HTTP.
     * @param res La réponse HTTP.
     */
    static async consolidated(_req: Request, res: Response) {
        const data = await reportService.getConsolidatedReport();
        res.json(data);
    }
}