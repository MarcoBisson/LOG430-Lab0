import { Request, Response } from 'express';
import { ReportService } from '../../application/services/ReportService';
import { PrismaSaleRepository } from '../../infrastructure/prisma/PrismaSaleRepository';
import { PrismaLogisticsRepository } from '../../infrastructure/prisma/PrismaLogisticsRepository';

const saleRepository = new PrismaSaleRepository();
const logisticsRepository = new PrismaLogisticsRepository();
const reportService = new ReportService(saleRepository, logisticsRepository);

export class ReportController {
    /**
     * Récupère un rapport consolidé des ventes, produits et stocks.
     * @param req La requête HTTP.
     * @param res La réponse HTTP.
     */
    static async consolidated(req: Request, res: Response) {
        const { startDate, endDate } = req.query;
        const data = await reportService.getConsolidatedReport({
            startDate: startDate ? new Date(startDate as string) : undefined,
            endDate: endDate ? new Date(endDate as string) : undefined,
        });
        res.json(data);
    }
}