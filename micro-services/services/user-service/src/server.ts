import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { config } from './config/config';
import { authRoutes } from './routes/authRoutes';
import { userRoutes } from './routes/userRoutes';
import { errorHandler } from './middlewares/errorHandler';
import { requestLogger } from './middlewares/requestLogger';
import { createAppLogger } from './utils/logger';
import { setupSwagger } from './config/swagger';
import jwt from 'jsonwebtoken';
import { PrismaUserRepository } from './repositories/PrismaUserRepository';

const app = express();
const logger = createAppLogger('AuthService');

// Middleware de sécurité
app.use(helmet());
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'],
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limite de 100 requêtes par fenêtre
  message: 'Trop de requêtes depuis cette IP, veuillez réessayer plus tard.'
});
app.use(limiter);

// Middleware pour le parsing du body
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Middleware de logging
app.use(requestLogger);

// Configuration Swagger
setupSwagger(app);

// Health check
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
    service: 'auth-service',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);

// Routes d'authentification pour Traefik Forward Auth
/**
 * @openapi
 * /api/auth/verify:
 *   get:
 *     summary: Vérification d'authentification pour Traefik
 *     description: Endpoint utilisé par Traefik pour valider l'authentification via JWT ou clé API
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *       - apiKey: []
 *     parameters:
 *       - in: header
 *         name: Authorization
 *         schema:
 *           type: string
 *         description: Token JWT (Bearer token)
 *       - in: header
 *         name: X-API-Key
 *         schema:
 *           type: string
 *         description: Clé API pour l'authentification
 *     responses:
 *       200:
 *         description: Authentification réussie
 *         headers:
 *           X-User-ID:
 *             description: ID de l'utilisateur authentifié
 *             schema:
 *               type: string
 *           X-User-Role:
 *             description: Rôle de l'utilisateur
 *             schema:
 *               type: string
 *           X-User-Access:
 *             description: Accès aux magasins (JSON)
 *             schema:
 *               type: string
 *       401:
 *         description: Authentification échouée
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
app.get('/api/auth/verify', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    const apiKey = req.headers['x-api-key'] as string;
    const userRepository = new PrismaUserRepository();

    // Vérification par clé API
    if (apiKey) {
      const validApiKeys = [
        'api-key-admin-12345',
        'api-key-client-67890',
        'api-key-mobile-app-111'
      ];
      
      if (validApiKeys.includes(apiKey)) {
        res.set({
          'X-User-ID': 'api-user',
          'X-User-Role': 'API',
          'X-User-Access': 'ALL'
        });
        return res.status(200).send('API Key valid');
      } else {
        return res.status(401).json({ error: 'Clé API invalide' });
      }
    }

    // Vérification par JWT
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Token manquant' });
    }

    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, config.jwtSecret) as any;

    // Vérifier si l'utilisateur existe toujours
    const user = await userRepository.getUserById(decoded.userId);

    if (!user) {
      return res.status(401).json({ error: 'Utilisateur non trouvé' });
    }

    // Ajouter les headers pour Traefik
    res.set({
      'X-User-ID': user.id.toString(),
      'X-User-Role': user.role,
      'X-User-Access': JSON.stringify(user.access?.map((store: any) => store.id) || [])
    });

    return res.status(200).send('Token valid');

  } catch (error) {
    logger.error('Erreur validation token:', error);
    return res.status(401).json({ error: 'Token invalide' });
  }
});

// Endpoint pour valider les clés API
app.post('/api/auth/validate-key', async (req, res) => {
  const apiKey = req.headers['x-api-key'] as string;
  
  if (!apiKey) {
    return res.status(401).json({ error: 'Clé API manquante' });
  }

  const validApiKeys = [
    'api-key-admin-12345',
    'api-key-client-67890',
    'api-key-mobile-app-111'
  ];
  
  if (validApiKeys.includes(apiKey)) {
    return res.status(200).json({ valid: true, keyType: 'API' });
  } else {
    return res.status(401).json({ error: 'Clé API invalide' });
  }
});

// Middleware de gestion d'erreurs
app.use(errorHandler);

// Route 404
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Route non trouvée',
    path: req.originalUrl
  });
});

const PORT = config.port;

app.listen(PORT, () => {
  logger.info(`🚀 Auth Service démarré sur le port ${PORT}`);
  logger.info(`📊 Health check disponible sur http://localhost:${PORT}/health`);
  logger.info(`📚 Documentation API : http://localhost:${PORT}/api-docs`);
  
  console.log(`🚀 Auth Service démarré sur le port ${PORT}`);
  console.log(`📚 Documentation API : http://localhost:${PORT}/api-docs`);
  console.log(`💚 Health check: http://localhost:${PORT}/health`);
});

export default app;
