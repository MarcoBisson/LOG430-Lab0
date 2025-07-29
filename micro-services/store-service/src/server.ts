import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import storeRoutes from './routes/storeRoutes';
import stockRoutes from './routes/stockRoutes';
import { setupSwagger } from './config/swagger';

// Charger les variables d'environnement
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3032;

// Middleware de sécurité
app.use(helmet());
app.use(cors());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // limite chaque IP à 1000 requêtes par fenêtre de temps
  message: 'Trop de requêtes depuis cette IP, veuillez réessayer plus tard.'
});
app.use('/api/', limiter);

// Middleware pour parser JSON
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Configuration Swagger
setupSwagger(app);

// Routes de santé
/**
 * @openapi
 * /health:
 *   get:
 *     summary: Vérification de l'état du service
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: Service opérationnel
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/HealthCheck'
 */
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'OK', 
    service: 'store-service',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    version: '1.0.0'
  });
});

/**
 * @openapi
 * /ready:
 *   get:
 *     summary: Vérification de la disponibilité du service
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: Service prêt à recevoir du trafic
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: Ready
 *                 service:
 *                   type: string
 *                   example: store-service
 */
app.get('/ready', (req, res) => {
  // Ici on pourrait vérifier la connexion à la base de données
  res.status(200).json({ 
    status: 'Ready',
    service: 'store-service'
  });
});

// Routes principales
app.use('/api/stores', storeRoutes);
app.use('/api/stocks', stockRoutes);

// Route par défaut
app.get('/', (req, res) => {
  res.json({
    message: 'Store Service API',
    version: '1.0.0',
    endpoints: {
      stores: '/api/stores',
      stocks: '/api/stocks',
      health: '/health',
      ready: '/ready'
    }
  });
});

// Gestionnaire d'erreurs 404
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Route non trouvée',
    path: req.originalUrl,
    method: req.method
  });
});

// Gestionnaire d'erreurs global
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Erreur serveur:', err);
  res.status(500).json({
    error: 'Erreur interne du serveur',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Une erreur est survenue'
  });
});

// Démarrage du serveur
app.listen(PORT, () => {
  console.log(`🏪 Store Service démarré sur le port ${PORT}`);
  console.log(`📊 Environnement: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔗 API disponible sur: http://localhost:${PORT}`);
  console.log(`💚 Health check: http://localhost:${PORT}/health`);
});

export default app;
