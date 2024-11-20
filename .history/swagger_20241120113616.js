// swagger.js
import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';

const swaggerOptions = {
  definition: {
    openapi: '3.0.0', // Version de l'OpenAPI (Swagger 3.0)
    info: {
      title: 'API Node.js avec Express', // Nom de l'API
      version: '1.0.0', // Version de l'API
      description: 'API avec des routes publiques et protégées', // Description de l’API
    },
    servers: [
      {
        url: 'http://localhost:5000', // URL du serveur de développement
      },
    ],
  },
  apis: ['./routes/userRoutes.js'], // Chemin vers vos fichiers de routes
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);

const swaggerDocs = (app) => {
  // Point d’accès à la documentation
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
};

export default swaggerDocs;
