import * as express from 'express';
import * as cors from 'cors';
import productRoutes from './interfaces/routes/ProductRoutes';
import saleRoutes from './interfaces/routes/SaleRoutes';
import returnRoutes from './interfaces/routes/ReturnRoutes';
import reportRoutes from './interfaces/routes/ReportRoutes';
import logisticsRoutes from './interfaces/routes/LogisticsRoutes';
import inventoryRoutes from './interfaces/routes/InventoryRoutes';
import AuthRoutes from './interfaces/routes/UserRoutes';
import { setupSwagger } from './swagger';

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/products', productRoutes);
app.use('/api/sales', saleRoutes);
app.use('/api/returns', returnRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/logistics', logisticsRoutes);
app.use('/api/stock', inventoryRoutes);
app.use('/api/auth', AuthRoutes);

setupSwagger(app);

app.listen(3000, () => {
    console.log('REST API running on http://localhost:3000');
    console.log('Swagger disponible sur http://localhost:3000/api-docs');
});