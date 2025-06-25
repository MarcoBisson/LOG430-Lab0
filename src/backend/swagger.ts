import * as swaggerJsdoc from 'swagger-jsdoc';
import * as swaggerUi from 'swagger-ui-express';
import { Express } from 'express'

export function setupSwagger(app: Express) {
  const options = {
    definition: {
      openapi: '3.0.0',
      info: {
        title: 'Documentation API',
        version: '1.0.0',
        description: 'API Express avec Swagger auto-généré',
      },
    },
    apis: ['./**/**/*.ts'], // fichiers où Swagger va lire les commentaires JSDoc
  }

  const specs = swaggerJsdoc(options)
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs))
}