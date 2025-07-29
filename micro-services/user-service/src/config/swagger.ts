import swaggerJSDoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import { Application } from 'express';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Auth Service API',
      version: '1.0.0',
      description: 'Microservice d\'authentification et gestion des utilisateurs',
      contact: {
        name: 'Équipe de développement',
        email: 'dev@example.com',
      },
    },
    servers: [
      {
        url: 'http://localhost:3031',
        description: 'Serveur de développement',
      },
      {
        url: 'http://localhost/api/auth',
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
        User: {
          type: 'object',
          properties: {
            id: {
              type: 'integer',
              description: 'ID unique de l\'utilisateur',
            },
            email: {
              type: 'string',
              format: 'email',
              description: 'Email de l\'utilisateur',
            },
            firstName: {
              type: 'string',
              description: 'Prénom de l\'utilisateur',
            },
            lastName: {
              type: 'string',
              description: 'Nom de famille de l\'utilisateur',
            },
            role: {
              type: 'string',
              enum: ['ADMIN', 'MANAGER', 'EMPLOYEE'],
              description: 'Rôle de l\'utilisateur',
            },
            storeId: {
              type: 'integer',
              nullable: true,
              description: 'ID du magasin assigné',
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
        LoginRequest: {
          type: 'object',
          required: ['username', 'password'],
          properties: {
            username: {
              type: 'string',
              description: 'Nom d\'utilisateur',
            },
            password: {
              type: 'string',
              minLength: 6,
              description: 'Mot de passe',
            },
          },
        },
        LoginResponse: {
          type: 'object',
          properties: {
            token: {
              type: 'string',
              description: 'Token JWT d\'authentification',
            },
            user: {
              $ref: '#/components/schemas/User',
            },
          },
        },
        CreateUserRequest: {
          type: 'object',
          required: ['email', 'password', 'firstName', 'lastName', 'role'],
          properties: {
            email: {
              type: 'string',
              format: 'email',
              description: 'Email de l\'utilisateur',
            },
            password: {
              type: 'string',
              minLength: 6,
              description: 'Mot de passe',
            },
            firstName: {
              type: 'string',
              description: 'Prénom de l\'utilisateur',
            },
            lastName: {
              type: 'string',
              description: 'Nom de famille de l\'utilisateur',
            },
            role: {
              type: 'string',
              enum: ['ADMIN', 'MANAGER', 'EMPLOYEE'],
              description: 'Rôle de l\'utilisateur',
            },
            storeId: {
              type: 'integer',
              nullable: true,
              description: 'ID du magasin assigné',
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
              example: 'auth-service',
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
    customSiteTitle: 'Auth Service API Documentation',
  }));

  // Route pour obtenir le JSON de la spécification
  app.get('/api-docs.json', (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(specs);
  });
};
