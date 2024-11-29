import express from 'express';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';
import cors from 'cors';
import http from 'http';
import { Server as SocketIO } from 'socket.io';
import { SerialPort, ReadlineParser } from 'serialport'; // Port série
import connectDB from './config/db.js'; // Connexion MongoDB
import swaggerDocs from './swagger.js'; // Documentation API

// Importation des routes
import authentificationRoutes from './routes/authentification.js';
import collecteRoutes from './routes/collecte.js';
import userRoutes from './routes/user.js';
import historiqueRoutes from './routes/historique.js';
import { captureData } from './controllers/dataController.js';
import CapteurRoutes from './routes/capteur.js';

// Charger les variables d'environnement
dotenv.config();

// Initialiser l'application Express
const app = express();

// Créer un serveur HTTP
const server = http.createServer(app);

// Configurer Socket.IO
const io = new SocketIO(server, {
  cors: {
    origin: '*', // Assurez-vous que votre frontend utilise cette origine
    methods: ['GET', 'POST'],
  },
});

// Connexion à la base de données
connectDB();

// Middleware
app.use(cors({
  origin: '*', // Autoriser uniquement le frontend
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
}));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Routes API
app.use('/api/auth', authentificationRoutes);
app.use('/api/users', userRoutes);
app.use('/api/collecte', collecteRoutes);
app.use('/api/historique', historiqueRoutes);
app.use('/api/capteurs', CapteurRoutes); 

// Middleware pour gestion des erreurs
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Une erreur est survenue sur le serveur.' });
});

// Serveur de documentation Swagger
swaggerDocs(app);

// Gestion du port série
const serialPort = new SerialPort({
  path: '/dev/ttyUSB0',
  baudRate: 9600,
  autoOpen: true,
});

const parser = serialPort.pipe(new ReadlineParser({ delimiter: '\n' }));

serialPort.on('open', () => {
  console.log('Connexion au port série établie');
});

serialPort.on('error', (err) => {
  console.error('Erreur du port série :', err.message);
});

// Lecture des données depuis le port série
parser.on('data', (data) => {
  const secretCode = data.trim();
  console.log(`Données reçues depuis Arduino : ${secretCode}`);
  
  // Émettre chaque chiffre du code secret via WebSocket
  for (let digit of secretCode) {
    io.emit('codeReceived', digit);
  }
});

// Gestion des connexions WebSocket
io.on('connection', (socket) => {
  console.log('Un client s\'est connecté'); // Affiché quand un client Angular se connecte

  socket.on('disconnect', () => {
    console.log('Un client s\'est déconnecté'); // Affiché quand un client Angular se déconnecte
  });
});

// Capture et diffusion des données Arduino via WebSocket
captureData(io);

// Lancer le serveur
const PORT = process.env.PORT || 5001;
server.listen(PORT, () => {
  console.log(`Serveur démarré sur http://localhost:${PORT}`);
  console.log('WebSocket disponible sur le même port.');
});
