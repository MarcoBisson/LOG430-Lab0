import type { Response } from 'express';
import { LogisticsService } from '../../application/services/LogisticsService';
import { PrismaLogisticsRepository } from '../../infrastructure/prisma/PrismaLogisticsRepository';
import { PrismaStoreRepository } from '../../infrastructure/prisma/PrismaStoreRepository';
import { PrismaUserRepository } from '../../infrastructure/prisma/PrismaUserRepository';
import type { AuthenticatedRequest } from '../middlewares/authentificateJWT';
import { UserRole } from '@prisma/client';
import { errorResponse } from '../../utils/errorResponse';

const logisticsRepository = new PrismaLogisticsRepository();
const storeRepository = new PrismaStoreRepository();
const logisticsService = new LogisticsService(logisticsRepository, storeRepository);
const userRepository = new PrismaUserRepository();

export class LogisticsController {
    /**
     * Enregistre une demande de réapprovisionnement.
     * @param req La requête HTTP contenant les détails de la demande.
     * @param res La réponse HTTP.
     */
    static async request(req: AuthenticatedRequest, res: Response) {
        try {
            const { storeId, productId, quantity } = req.body;

            if (req.user){
                const access = await userRepository.getUserAccess(req.user.id);

                if (access.find( store => store.id === storeId)){
                    const result = await logisticsService.requestReplenishment(+storeId, +productId, +quantity);
                    res.status(201).json(result);
                } else {
                    errorResponse(res, 401, 'Unauthorized', 'Acces Unauthorized', req.originalUrl);
                }
                
            } else {
                errorResponse(res, 403, 'Forbidden', 'Invalid token', req.originalUrl);
            }
            
        } catch (err: any) {
            errorResponse(res, 400, 'Bad Request', err.message, req.originalUrl);
        }
    }

    /**
     * Approuve une demande de réapprovisionnement.
     * @param req La requête HTTP contenant l'ID de la demande à approuver.
     * @param res La réponse HTTP.
     */
    static async approve(req: AuthenticatedRequest, res: Response) {
        try {
            const { id } = req.params;
            if (req.user && req.user.role !== UserRole.CLIENT) {
                const result = await logisticsService.approveReplenishment(+id);
                res.json(result);
            } else {
                errorResponse(res, 401, 'Unauthorized', 'Acces Unauthorized', req.originalUrl);
            }
        } catch (err: any) {
            errorResponse(res, 400, 'Bad Request', err.message, req.originalUrl);
        }
    }

    /**
     * Alerte les utilisateurs sur les stocks critiques.
     * @param req La requête HTTP.
     * @param res La réponse HTTP.
     */
    static async alerts(req: AuthenticatedRequest, res: Response) {
        if (req.user && req.user.role !== UserRole.CLIENT) {
            const alerts = await logisticsService.checkCriticalStock();
            res.json(alerts);
        } else {
            errorResponse(res, 401, 'Unauthorized', 'Acces Unauthorized', req.originalUrl);
        }
    }

    /**
     * Liste tous les requetes de réapprovisionnement.
     * @param req La requête HTTP.
     * @param res La réponse HTTP.
     */
    static async replenishments(req: AuthenticatedRequest, res: Response) {
        if (req.user && req.user.role !== UserRole.CLIENT) {
            const alerts = await logisticsService.getReplenishments();
            res.json(alerts);
        } else {
            errorResponse(res, 401, 'Unauthorized', 'Acces Unauthorized', req.originalUrl);
        }
    }
}
