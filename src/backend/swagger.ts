import * as swaggerJsdoc from 'swagger-jsdoc';
import * as swaggerUi from 'swagger-ui-express';
import type { Express } from 'express';

export function setupSwagger(app: Express) {
  const options = {
    definition: {
      openapi: '3.0.0',
      info: {
        title: 'Documentation API',
        version: '1.0.0',
        description: 'API Express avec Swagger auto-généré',
      },
      tags: [
        { name: 'Auth', description: 'Authentification et gestion des sessions' },
        { name: 'Inventaire', description: 'Gestion des stocks' },
        { name: 'Produits', description: 'Opérations sur les produits' },
        { name: 'Retour', description: 'Opérations de retour de vente' },
        { name: 'Logistique', description: 'Gestion de réapprovisionement' },
        { name: 'Ventes', description: 'Opérations de vente' },
        { name: 'Rapports', description: 'Gestion des rapports' },
      ],
      components: {
        securitySchemes: {
          bearerAuth: {
            type: 'http',
            scheme: 'bearer',
            bearerFormat: 'JWT',
          },
        },
      },
      security: [
        {
          bearerAuth: [],
        },
      ],
    },
    apis: ['./**/**/*.ts'], // fichiers où Swagger va lire les commentaires JSDoc
  };

  const specs = swaggerJsdoc(options);
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));
}