import type { Response } from 'express';
import { ReportService } from '../../application/services/ReportService';
import { PrismaSaleRepository } from '../../infrastructure/prisma/PrismaSaleRepository';
import { PrismaLogisticsRepository } from '../../infrastructure/prisma/PrismaLogisticsRepository';
import { errorResponse } from '../../utils/errorResponse';
import type { AuthenticatedRequest } from '../middlewares/authentificateJWT';
import { createControllerLogger } from '../../utils/logger';

const saleRepository = new PrismaSaleRepository();
const logisticsRepository = new PrismaLogisticsRepository();
const reportService = new ReportService(saleRepository, logisticsRepository);
const log = createControllerLogger('ReportController');

export class ReportController {
    /**
     * Récupère un rapport consolidé des ventes, produits et stocks.
     * @param req La requête HTTP.
     * @param res La réponse HTTP.
     */
    static async consolidated(req: AuthenticatedRequest, res: Response){
        try {
            const { startDate, endDate, limit, stockOffset } = req.query;
            const user = req.user;
            if (user){
                const data = await reportService.getConsolidatedReport(
                    user,
                    {
                        startDate: startDate ? new Date(startDate as string) : undefined,
                        endDate: endDate ? new Date(endDate as string) : undefined,
                        limit: limit ? parseInt(limit as string) : undefined,
                        stockOffset: stockOffset ? parseInt(stockOffset as string) : undefined,
                    },
                );
                log.info(`getConsolidateReport from ${startDate} to ${endDate} successful`, {data});
                res.json(data);
            } else {
                log.warn('Invalid token');
                errorResponse(res, 403, 'Forbidden', 'Invalid token', req.originalUrl);
            }
        } catch (err: any) {
            log.error('Error found', {message: err.message});
            errorResponse(res, 500, 'Internal Server Error', err.message, req.originalUrl);
        }
    }
}
