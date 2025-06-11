import { Router } from 'express';
import { ReturnController } from '../controllers/ReturnController';

const returnRoute = Router();
returnRoute.post('/:saleId', ReturnController.process);

export default returnRoute;