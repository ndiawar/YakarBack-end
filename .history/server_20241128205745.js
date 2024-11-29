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
import { SerialPort, ReadlineParser } from 'serialport'; // Port série
import { captureData } from './controllers/dataController.js'; // Capture des données Arduino
import CapteurRoutes from './routes/capteur.js';

// Charger les variables d'environnement
dotenv.config();

// Initialiser l'application Express
const app = express();

// Créer un serveur HTTP pour intégrer WebSocket
const server = http.createServer(app);

// Configurer Socket.IO pour WebSocket
const io = new SocketIO(server, {
  cors: {
    origin: '*', // Autoriser les origines définies dans .env
    methods: ['GET', 'POST'],
    credentials: true, // Autoriser les cookies avec les requêtes
  },
});

// Connexion à la base de données
connectDB();

// Middleware
app.use(cors({
  origin: '*',  // Permet uniquement l'accès depuis http://localhost:4200
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  credentials: false,  // Ne pas envoyer de cookies ou d'informations d'authentification
}));
app.use(bodyParser.json());  // Pour parser le corps des requêtes JSON
app.use(bodyParser.urlencoded({ extended: true }));
// app.use(cookieParser());     // Pour parser les cookies
// app.use(morgan(process.env.LOG_LEVEL || 'dev'));  // Loguer les requêtes HTTP

// Routes
app.use('/api/auth', authentificationRoutes);
app.use('/api/users', userRoutes);
app.use('/api/collecte', collecteRoutes);
app.use('/api/historique', historiqueRoutes);  // Ajouter les routes d'historique
app.use('/api/capteurs', CapteurRoutes);

// Middleware pour gestion des erreurs
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Une erreur est survenue sur le serveur.' });
});

//Connecteur Keypad pour connection avec code
// Gestion du port série
// const serialPort = new SerialPort({
//   path: '/dev/ttyACM0',
//   baudRate: 9600,
//   autoOpen: true,
// });

// const parser = serialPort.pipe(new ReadlineParser({ delimiter: '\n' }));

// serialPort.on('open', () => {
//   console.log('Connexion au port série établie');
// });

// serialPort.on('error', (err) => {
//   console.error('Erreur du port série :', err.message);
// });

// // Lecture des données depuis le port série
// parser.on('data', (data) => {
//   const secretCode = data.trim();
//   console.log(`Données reçues depuis Arduino : ${secretCode}`);

//   // Émettre chaque chiffre du code secret via WebSocket
//   for (let digit of secretCode) {
//     io.emit('codeReceived', digit);
//   }
// });

// Gestion des connexions WebSocket
io.on('connection', (socket) => {
  console.log('Un client s est connecté'); // Affiché quand un client Angular se connecte

  socket.on('disconnect', () => {
    console.log('Un client s est déconnecté'); // Affiché quand un client Angular se déconnecte
  });
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
