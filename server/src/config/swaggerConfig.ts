import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import { Express } from 'express';
import { getBackendUrl } from '../utils/envUtils'; // Adjust the path as needed

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Jewelry Website API',
      version: '1.0.0',
      description: 'API documentation for the Jewelry Website',
    },
    servers: [
      {
        url: `${getBackendUrl()}/api`, // Use the appropriate server URL based on environment
      },
    ],
  },
  apis: ['./src/api/routes/*.ts'], // Path to the API routes (changed to .ts)
};

const swaggerSpec = swaggerJsdoc(options);

const setupSwaggerDocs = (app: Express): void => {
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
};

export default setupSwaggerDocs;
