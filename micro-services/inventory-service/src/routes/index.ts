import { Router } from 'express';
import { ProductController } from '../controllers/ProductController';
import { InventoryController } from '../controllers/InventoryController';

const router = Router();

// Routes pour les produits
router.get('/products', ProductController.list);
router.get('/products/:id', ProductController.get);
router.post('/products/store/:id', ProductController.create);
router.put('/products/:productId/store/:storeId', ProductController.update);
router.delete('/products/:id', ProductController.delete);
router.get('/products/name/:name', ProductController.getByName);
router.get('/products/category/:category', ProductController.getByCategory);
router.get('/products/store/:id', ProductController.getByStore);
router.get('/products/search/:search', ProductController.search);

// Routes pour l'inventaire/stock
router.get('/stock/central', InventoryController.central);
router.get('/stock/store/:storeId', InventoryController.store);
router.get('/stock/store/:storeId/product/:productId', InventoryController.getProductStock);
router.put('/stock/store/:storeId/product/:productId', InventoryController.updateStock);
router.patch('/stock/store/:storeId/product/:productId/increment', InventoryController.incrementStock);
router.patch('/stock/store/:storeId/product/:productId/decrement', InventoryController.decrementStock);
router.get('/stock/low', InventoryController.getLowStocks);

export default router;
