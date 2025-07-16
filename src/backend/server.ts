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
import { metricsMiddleware, metricsRoute } from './metrics';
import { databaseMetricsService } from './application/services/DatabaseMetricsService';
import { redisCacheService } from './application/services/RedisCacheService';
import { cacheStatsHandler, cacheInvalidateHandler } from './interfaces/middlewares/cacheMiddleware';
import logger from './utils/logger';

const app = express();
app.use(cors());
app.use(express.json());
app.use(metricsMiddleware);

app.use('/api/products', productRoutes);
app.use('/api/sales', saleRoutes);
app.use('/api/returns', returnRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/logistics', logisticsRoutes);
app.use('/api/stock', inventoryRoutes);
app.use('/api/auth', AuthRoutes);

metricsRoute(app);

// Endpoints de gestion du cache Redis
app.get('/api/cache/stats', cacheStatsHandler as express.RequestHandler);
app.post('/api/cache/invalidate', cacheInvalidateHandler as express.RequestHandler);

// Endpoint pour les métriques détaillées de la base de données
app.get('/api/db-metrics', async (req, res) => {
  try {
    await databaseMetricsService.collectAllMetrics();
    res.json({
      message: 'Métriques de base de données collectées avec succès',
      timestamp: new Date().toISOString(),
      note: 'Consultez /metrics pour voir les métriques Prometheus',
    });
  } catch (error) {
    logger.error('Erreur lors de la collecte des métriques DB:', error);
    res.status(500).json({ error: 'Erreur lors de la collecte des métriques' });
  }
});

setupSwagger(app);

// Initialiser le service Redis Cache
async function initializeServices() {
  try {
    await redisCacheService.connect();
    logger.info('Service Redis Cache initialisé avec succès');
  } catch (error) {
    logger.warn('Redis Cache non disponible, continuera sans cache:', error);
  }
}

// Démarrer la collecte de métriques de base de données
databaseMetricsService.startMetricsCollection(30000); // Toutes les 30 secondes

app.listen(3030, '0.0.0.0', async () => {
    // Initialiser les services
    await initializeServices();
    
    logger.info('REST API running on http://0.0.0.0:3030');
    logger.info('Swagger disponible sur http://localhost:3030/api-docs');
    logger.info('Prometheus metrics disponible sur http://localhost:3030/metrics');
    logger.info('Cache Redis statistics: http://localhost:3030/api/cache/stats');
    logger.info('Collecte de métriques DB démarrée');
});