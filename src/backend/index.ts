import * as express from 'express';
import * as cors from 'cors';
import * as path from 'path';
import productRoutes from './routes/ProductRoutes';
import saleRoutes from './routes/SaleRoutes';
import returnRoutes from './routes/ReturnRoutes';
import reportRoutes from './routes/ReportRoutes';
import logisticsRoutes from './routes/LogisticsRoutes';
import inventoryRoutes from './routes/InventoryRoutes';

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/products', productRoutes);
app.use('/api/sales', saleRoutes);
app.use('/api/returns', returnRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/logistics', logisticsRoutes);
app.use('/api/stock', inventoryRoutes);

const staticPath = path.join(process.cwd(), 'dist', 'public');
console.log('🗂  Static files:', staticPath);
app.use(express.static(staticPath));

app.get('*', (_req, res) => {
    res.sendFile(path.join(staticPath, 'index.html'));
});

app.listen(3000, () => console.log('REST API running on http://localhost:3000'));