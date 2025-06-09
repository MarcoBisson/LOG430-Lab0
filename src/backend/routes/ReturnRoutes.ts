import { Router } from 'express';
import { ReturnController } from '../controllers/ReturnController';

const returnRoute = Router();
returnRoute.post('/', ReturnController.process);

export default returnRoute;