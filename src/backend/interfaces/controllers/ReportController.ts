import { Response } from 'express';
import { ReportService } from '../../application/services/ReportService';
import { PrismaSaleRepository } from '../../infrastructure/prisma/PrismaSaleRepository';
import { PrismaLogisticsRepository } from '../../infrastructure/prisma/PrismaLogisticsRepository';
import { AuthenticatedRequest } from '../middlewares/authentificateJWT';

const saleRepository = new PrismaSaleRepository();
const logisticsRepository = new PrismaLogisticsRepository();
const reportService = new ReportService(saleRepository, logisticsRepository);

export class ReportController {
    /**
     * Récupère un rapport consolidé des ventes, produits et stocks.
     * @param req La requête HTTP.
     * @param res La réponse HTTP.
     */
    static async consolidated(req: AuthenticatedRequest, res: Response){
        try {
            const { startDate, endDate } = req.query;
            const user = req.user

            if (user){
                const data = await reportService.getConsolidatedReport(
                    user,
                    {
                        startDate: startDate ? new Date(startDate as string) : undefined,
                        endDate: endDate ? new Date(endDate as string) : undefined,
                    }
                );
                res.json(data);
            } else {
                res.status(403).json({ error: 'Invalid token' });
            }
            
        } catch (error: any) {
            res.status(500).json({ error: 'Erreur interne du serveur' });
        }
    }
}