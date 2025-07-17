import swaggerJSDoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import { Application } from 'express';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Store Service API',
      version: '1.0.0',
      description: 'Microservice de gestion des magasins et stocks',
      contact: {
        name: 'Équipe de développement',
        email: 'dev@example.com',
      },
    },
    servers: [
      {
        url: 'http://localhost:3032',
        description: 'Serveur de développement',
      },
      {
        url: 'http://localhost/api/stores',
        description: 'Via Gateway Traefik',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
        apiKey: {
          type: 'apiKey',
          in: 'header',
          name: 'X-API-Key',
        },
      },
      schemas: {
        Store: {
          type: 'object',
          properties: {
            id: {
              type: 'integer',
              description: 'ID unique du magasin',
            },
            name: {
              type: 'string',
              description: 'Nom du magasin',
            },
            address: {
              type: 'string',
              description: 'Adresse du magasin',
            },
            phone: {
              type: 'string',
              description: 'Numéro de téléphone',
            },
            email: {
              type: 'string',
              format: 'email',
              description: 'Email de contact',
            },
            type: {
              type: 'string',
              enum: ['STORE', 'WAREHOUSE'],
              description: 'Type de magasin',
            },
            isActive: {
              type: 'boolean',
              description: 'Statut actif du magasin',
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: 'Date de création',
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
              description: 'Date de dernière modification',
            },
          },
        },
        StoreStock: {
          type: 'object',
          properties: {
            id: {
              type: 'integer',
              description: 'ID unique du stock',
            },
            storeId: {
              type: 'integer',
              description: 'ID du magasin',
            },
            productId: {
              type: 'integer',
              description: 'ID du produit',
            },
            quantity: {
              type: 'integer',
              minimum: 0,
              description: 'Quantité en stock',
            },
            minThreshold: {
              type: 'integer',
              minimum: 0,
              description: 'Seuil minimum d\'alerte',
            },
            maxThreshold: {
              type: 'integer',
              minimum: 0,
              description: 'Seuil maximum de stockage',
            },
            lastUpdated: {
              type: 'string',
              format: 'date-time',
              description: 'Date de dernière mise à jour du stock',
            },
          },
        },
        CreateStoreRequest: {
          type: 'object',
          required: ['name', 'address', 'type'],
          properties: {
            name: {
              type: 'string',
              description: 'Nom du magasin',
            },
            address: {
              type: 'string',
              description: 'Adresse du magasin',
            },
            phone: {
              type: 'string',
              description: 'Numéro de téléphone',
            },
            email: {
              type: 'string',
              format: 'email',
              description: 'Email de contact',
            },
            type: {
              type: 'string',
              enum: ['STORE', 'WAREHOUSE'],
              description: 'Type de magasin',
            },
          },
        },
        UpdateStoreRequest: {
          type: 'object',
          properties: {
            name: {
              type: 'string',
              description: 'Nom du magasin',
            },
            address: {
              type: 'string',
              description: 'Adresse du magasin',
            },
            phone: {
              type: 'string',
              description: 'Numéro de téléphone',
            },
            email: {
              type: 'string',
              format: 'email',
              description: 'Email de contact',
            },
            isActive: {
              type: 'boolean',
              description: 'Statut actif du magasin',
            },
          },
        },
        UpdateStockRequest: {
          type: 'object',
          required: ['quantity'],
          properties: {
            quantity: {
              type: 'integer',
              minimum: 0,
              description: 'Nouvelle quantité en stock',
            },
            minThreshold: {
              type: 'integer',
              minimum: 0,
              description: 'Seuil minimum d\'alerte',
            },
            maxThreshold: {
              type: 'integer',
              minimum: 0,
              description: 'Seuil maximum de stockage',
            },
          },
        },
        Error: {
          type: 'object',
          properties: {
            error: {
              type: 'string',
              description: 'Message d\'erreur',
            },
            details: {
              type: 'array',
              items: {
                type: 'string',
              },
              description: 'Détails de l\'erreur',
            },
          },
        },
        HealthCheck: {
          type: 'object',
          properties: {
            status: {
              type: 'string',
              example: 'OK',
            },
            timestamp: {
              type: 'string',
              format: 'date-time',
            },
            service: {
              type: 'string',
              example: 'store-service',
            },
            version: {
              type: 'string',
              example: '1.0.0',
            },
          },
        },
      },
    },
  },
  apis: ['./src/routes/*.ts', './src/server.ts'], // Chemins vers les fichiers contenant les annotations
};

const specs = swaggerJSDoc(options);

export const setupSwagger = (app: Application): void => {
  app.use('/api-docs', ...swaggerUi.serve, swaggerUi.setup(specs, {
    customSiteTitle: 'Store Service API Documentation',
  }));

  // Route pour obtenir le JSON de la spécification
  app.get('/api-docs.json', (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(specs);
  });
};
