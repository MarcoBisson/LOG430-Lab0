import * as fs from 'fs';
import * as path from 'path';
import * as swaggerJsdoc from 'swagger-jsdoc';
import * as yaml from 'js-yaml';

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'API Documentation',
      version: '1.0.0',
    },
  },
  apis: ['./**/**/*.ts'],
};

const swaggerSpec = swaggerJsdoc(options);

// Écriture au format JSON
fs.writeFileSync(path.resolve(__dirname, 'swagger.json'), JSON.stringify(swaggerSpec, null, 2));

// Écriture au format YAML
const yamlSpec = yaml.dump(swaggerSpec);
fs.writeFileSync(path.resolve(__dirname, 'swagger.yaml'), yamlSpec);

console.log('✅ Swagger documentation generated in swagger.json and swagger.yaml');