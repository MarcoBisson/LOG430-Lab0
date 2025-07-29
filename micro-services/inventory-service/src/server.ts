import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import { PrismaClient } from '@prisma/client';
import router from './routes';
import { ProductController } from './controllers/ProductController';
import { InventoryController } from './controllers/InventoryController';
import { ProductService } from './services/ProductService';
import { InventoryService } from './services/InventoryService';
import { PrismaProductRepository } from './repositories/PrismaProductRepository';
import { PrismaInventoryRepository } from './repositories/PrismaInventoryRepository';

const app = express();
const PORT = process.env.PORT || 3033;

// Middleware
app.use(cors());
app.use(express.json());
app.use(morgan('combined'));

// Configuration Swagger
const swaggerOptions = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'Inventory Service API',
            version: '1.0.0',
            description: 'API pour la gestion des produits et de l\'inventaire',
        },
        servers: [
            {
                url: `http://localhost:${PORT}`,
                description: 'Serveur de développement',
            },
        ],
        components: {
            schemas: {
                Product: {
                    type: 'object',
                    properties: {
                        id: { type: 'integer' },
                        name: { type: 'string' },
                        price: { type: 'number' },
                        description: { type: 'string', nullable: true },
                        category: { type: 'string', nullable: true },
                    },
                },
                ProductStock: {
                    allOf: [
                        { $ref: '#/components/schemas/Product' },
                        {
                            type: 'object',
                            properties: {
                                stock: { type: 'integer' },
                            },
                        },
                    ],
                },
                ProductInput: {
                    type: 'object',
                    required: ['name', 'price'],
                    properties: {
                        name: { type: 'string' },
                        price: { type: 'number', minimum: 0 },
                        description: { type: 'string' },
                        category: { type: 'string' },
                        stock: { type: 'integer', minimum: 0, default: 0 },
                    },
                },
                StoreStock: {
                    type: 'object',
                    properties: {
                        id: { type: 'integer' },
                        storeId: { type: 'integer' },
                        productId: { type: 'integer' },
                        quantity: { type: 'integer' },
                    },
                },
            },
        },
    },
    apis: ['./src/controllers/*.ts', './src/entities/*.ts'],
};

const specs = swaggerJsdoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));

// Health check
app.get('/health', (req: express.Request, res: express.Response) => {
    res.status(200).json({ 
        status: 'OK', 
        service: 'inventory-service',
        timestamp: new Date().toISOString(),
        port: PORT 
    });
});

// Routes API
app.use('/api/inventory', router);

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
    const productRepo = new PrismaProductRepository(prisma);
    const inventoryRepo = new PrismaInventoryRepository(prisma);
    
    // Initialiser les services
    const productService = new ProductService(productRepo);
    const inventoryService = new InventoryService(inventoryRepo);
    
    // Injecter les services dans les controllers
    ProductController.setProductService(productService);
    InventoryController.setInventoryService(inventoryService);
    
    console.log('✅ Services Prisma initialisés avec succès');
    
    return { prisma, productService, inventoryService };
}

// Démarrage du serveur
if (require.main === module) {
    const { prisma } = initializeServices();
    
    // Gestion propre de l'arrêt
    const gracefulShutdown = async (signal: string) => {
        console.log(`📴 Signal ${signal} reçu, arrêt en cours...`);
        await prisma.$disconnect();
        process.exit(0);
    };
    
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));
    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    
    app.listen(PORT, () => {
        console.log(`🚀 Inventory Service démarré sur le port ${PORT}`);
        console.log(`📚 Documentation API disponible sur http://localhost:${PORT}/api-docs`);
        console.log(`❤️  Health check disponible sur http://localhost:${PORT}/health`);
        console.log(`🗄️  Base de données Prisma connectée`);
    });
}

export default app;
