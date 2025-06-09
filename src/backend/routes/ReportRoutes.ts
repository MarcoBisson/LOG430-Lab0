import { Router } from 'express';
import { ReportController } from '../controllers/ReportController';

const reportRoutes = Router();
reportRoutes.get('/consolidated', ReportController.consolidated);

export default reportRoutes;