import { Router } from 'express';
import { InventoryController } from '../controllers/InventoryController';
const inventoryRoutes = Router();

inventoryRoutes.get('/central', InventoryController.central);
inventoryRoutes.get('/store/:storeId', InventoryController.store);

export default inventoryRoutes;