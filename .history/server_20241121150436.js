import express from 'express';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';
import http from 'http'; // Pour créer un serveur HTTP
import { Server as SocketIO } from 'socket.io'; // WebSocket avec Socket.IO
import connectDB from './config/db.js'; // Connexion MongoDB
import swaggerDocs from './swagger.js'; // Documentation API
import authentificationRoutes from './routes/authentification.js';
import userRoutes from './routes/user.js';
import collecteRoutes from './routes/collecte.js';
import historiqueRoutes from './routes/historique.js';
import { captureData } from './controllers/dataController.js'; // Capture des données Arduino

// Charger les variables d'environnement
dotenv.config();

// Initialiser l'application Express
const app = express();

// Créer un serveur HTTP pour intégrer WebSocket
const server = http.createServer(app);

// Configurer Socket.IO pour WebSocket
const io = new SocketIO(server, {
  cors: {
    origin: process.env.CORS_ORIGINS.split(','), // Autoriser les origines définies dans .env
    methods: ['GET', 'POST'],
  },
});

// Connexion à la base de données
connectDB();

// Middleware
app.use(cors());
app.use(bodyParser.json());  // Pour parser le corps des requêtes JSON
app.use(cookieParser());     // Pour parser les cookies
app.use(morgan(process.env.LOG_LEVEL || 'dev'));  // Loguer les requêtes HTTP

// Routes
app.use('/api/auth', authentificationRoutes);
app.use('/api/users', userRoutes);
app.use('/api/collecte', collecteRoutes);
app.use('/api/historique', historiqueRoutes);  // Ajouter les routes d'historique

// Middleware pour gestion des erreurs
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Une erreur est survenue sur le serveur.' });
});

// Serveur de documentation Swagger
swaggerDocs(app); // Fonction qui charge Swagger UI à /api-docs

// WebSocket : Capture et diffusion des données Arduino
captureData(io);

// Lancer le serveur
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Serveur démarré sur http://localhost:${PORT}`);
  console.log('WebSocket disponible sur le même port.');
});
