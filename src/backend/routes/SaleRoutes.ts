import { Router } from 'express';
import { SaleController } from '../controllers/SaleController';
const saleRoutes = Router();

saleRoutes.post('/', SaleController.record);
saleRoutes.get('/:id', SaleController.get);

export default saleRoutes;
