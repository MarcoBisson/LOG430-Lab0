import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import { PrismaClient } from '@prisma/client';
import saleRoutes from './routes/saleRoutes';
import returnRoutes from './routes/returnRoutes';
import { SaleController } from './controllers/SaleController';
import { ReturnController } from './controllers/ReturnController';
import { SaleService } from './services/SaleService';
import { ReturnService } from './services/ReturnService';
import { PrismaSaleRepository } from './infrastructure/PrismaSaleRepository';

const app = express();
const PORT = process.env.PORT || 3034;

// Middleware
app.use(cors());
app.use(express.json());
app.use(morgan('combined'));

// Configuration Swagger
const swaggerOptions = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'Sales Service API',
            version: '1.0.0',
            description: 'API pour la gestion des ventes et des retours',
        },
        servers: [
            {
                url: `http://localhost:${PORT}`,
                description: 'Serveur de développement',
            },
        ],
        components: {
            schemas: {
                Sale: {
                    type: 'object',
                    properties: {
                        id: { type: 'integer' },
                        date: { type: 'string', format: 'date-time' },
                        storeId: { type: 'integer' },
                        saleItems: {
                            type: 'array',
                            items: {
                                $ref: '#/components/schemas/SaleItem'
                            }
                        },
                    },
                },
                SaleItem: {
                    type: 'object',
                    properties: {
                        id: { type: 'integer' },
                        saleId: { type: 'integer' },
                        productId: { type: 'integer' },
                        quantity: { type: 'integer' },
                        unitPrice: { type: 'number' },
                    },
                },
                CartItem: {
                    type: 'object',
                    properties: {
                        productId: { type: 'integer' },
                        quantity: { type: 'integer' },
                    },
                },
                SaleInput: {
                    type: 'object',
                    required: ['storeId', 'items'],
                    properties: {
                        storeId: { type: 'integer' },
                        items: {
                            type: 'array',
                            items: {
                                $ref: '#/components/schemas/CartItem'
                            }
                        },
                    },
                },
                Error: {
                    type: 'object',
                    properties: {
                        error: { type: 'string' },
                        message: { type: 'string' },
                        details: { type: 'string' },
                    },
                },
            },
        },
    },
    apis: ['./src/routes/*.ts', './src/controllers/*.ts', './src/entities/*.ts'],
};

const specs = swaggerJsdoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));

// Health check
app.get('/health', (req: express.Request, res: express.Response) => {
    res.status(200).json({ 
        status: 'OK', 
        service: 'sales-service',
        timestamp: new Date().toISOString(),
        port: PORT 
    });
});

// Test simple endpoint
app.get('/', (req: express.Request, res: express.Response) => {
    res.json({ 
        message: 'Sales Service API', 
        version: '1.0.0',
        endpoints: ['/health', '/api/sales', '/api/returns', '/api-docs', '/db-status']
    });
});

// Database status endpoint
app.get('/db-status', async (req: express.Request, res: express.Response) => {
    try {
        // Import Prisma dynamiquement pour éviter les erreurs au startup
        const { PrismaClient } = await import('@prisma/client');
        const prisma = new PrismaClient();
        
        // Test simple de connexion
        await prisma.$connect();
        await prisma.$disconnect();
        
        res.json({
            status: 'OK',
            message: 'Base de données connectée',
            timestamp: new Date().toISOString()
        });
    } catch (error: any) {
        res.status(503).json({
            status: 'ERROR',
            message: 'Base de données non disponible',
            error: error.message,
            timestamp: new Date().toISOString()
        });
    }
});

// Routes API (avec gestion d'erreur)
try {
    app.use('/api/sales', saleRoutes);
    app.use('/api/returns', returnRoutes);
    console.log('✅ Routes API configurées');
} catch (error) {
    console.error('❌ Erreur lors de la configuration des routes:', error);
    console.log('⚠️  Service démarré en mode dégradé - seuls /health et / sont disponibles');
}

// Gestion des erreurs 404
app.use('*', (req: express.Request, res: express.Response) => {
    res.status(404).json({ error: 'Route non trouvée' });
});

// Gestion des erreurs globales
app.use((error: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.error('Erreur serveur:', error);
    res.status(500).json({ error: 'Erreur interne du serveur' });
});

// Initialisation des services avec Prisma
function initializeServices() {
    const prisma = new PrismaClient();
    
    // Initialiser les repositories
    const saleRepo = new PrismaSaleRepository(prisma);
    
    // Initialiser les services
    const saleService = new SaleService(saleRepo);
    const returnService = new ReturnService(saleRepo);
    
    // Injecter les services dans les controllers
    SaleController.setSaleService(saleService);
    ReturnController.setServices(returnService, saleRepo);
    
    console.log('✅ Services Prisma initialisés avec succès');
    
    return { prisma, saleService, returnService };
}

// Initialiser les services immédiatement
const { prisma } = initializeServices();

// Démarrage du serveur
if (require.main === module) {
    // Gestion propre de l'arrêt
    const gracefulShutdown = async (signal: string) => {
        console.log(`📴 Signal ${signal} reçu, arrêt en cours...`);
        await prisma.$disconnect();
        process.exit(0);
    };
    
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));
    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    
    app.listen(PORT, () => {
        console.log(`🚀 Sales Service démarré sur le port ${PORT}`);
        console.log(`📚 Documentation API disponible sur http://localhost:${PORT}/api-docs`);
        console.log(`❤️  Health check disponible sur http://localhost:${PORT}/health`);
        console.log(`🗄️  Base de données Prisma connectée`);
    });
}

export default app;
