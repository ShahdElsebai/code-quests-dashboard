import swaggerJsdoc from 'swagger-jsdoc';

export const swaggerSpec = swaggerJsdoc({
  definition: {
    openapi: '3.0.0', 
    info: {
      title: 'Nuxt Backend API',
      version: '1.0.0',
      description: 'API documentation for Nuxt backend',
    },
    servers: [{ url: 'http://localhost:3000' }],
  },
  apis: ['./server/api/**/*.ts'], 
});
