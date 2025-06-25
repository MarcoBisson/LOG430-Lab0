import { Router } from 'express';
import { ProductController } from '../controllers/ProductController';
const productRoutes = Router();

productRoutes.get('/', ProductController.list);
productRoutes.get('/:id', ProductController.get);
productRoutes.get('/search/name/:name', ProductController.getByName);
productRoutes.get('/search/category/:category', ProductController.getByCategory);
productRoutes.post('/', ProductController.create);
productRoutes.put('/:id', ProductController.update);
productRoutes.delete('/:id', ProductController.delete);
productRoutes.get('/store/:id', ProductController.getByStore);

export default productRoutes;