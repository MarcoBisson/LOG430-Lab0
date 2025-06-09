import { Router } from 'express';
import { LogisticsController } from '../controllers/LogisticsController';
const logisticsRoutes = Router();

logisticsRoutes.post('/replenishment', LogisticsController.request);
logisticsRoutes.post('/replenishment/:id/approve', LogisticsController.approve);
logisticsRoutes.get('/alerts', LogisticsController.alerts);

export default logisticsRoutes;