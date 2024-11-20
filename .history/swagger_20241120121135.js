// swagger.js
import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';

const swaggerOptions = {
  definition: {
    openapi: '3.0.0', // Version de l'OpenAPI (Swagger 3.0)
    info: {
      title: 'yakar-API Documentation', // Nom de l'API
      version: '1.0.0', // Version de l'API
      description: 'L’API YAKAR est une solution de gestion intelligente destinée à la surveillance et au contrôle des conditions climatiques (température et humidité) dans le magasin de stockage d’une structure de transformation de produits locaux. Cette API a été conçue pour répondre aux besoins opérationnels de YAKAR, en assurant un suivi précis et en offrant des fonctionnalités de gestion avancées adaptées aux rôles des utilisateurs (administrateurs et utilisateurs simples).', // Description de l’API
    },
    servers: [
      {
        url: 'http://localhost:5000', // URL du serveur de développement
      },
    ],
  },
  apis: ['./routes/*.js'], // Chemin vers vos fichiers de routes
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);

const swaggerDocs = (app) => {
  // Point d’accès à la documentation
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
};

export default swaggerDocs;
