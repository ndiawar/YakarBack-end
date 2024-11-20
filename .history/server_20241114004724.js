import express from 'express';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';
import cors from 'cors';
import cookieParser from 'cookie-parser';  // Importer cookie-parser
import morgan from 'morgan';  // Importer morgan
import connectDB from './config/db.js';  // Assurer de l'extension .js
import userRoutes from './routes/userRoutes.js';  // Assurer de l'extension .js

// Charger les variables d'environnement
dotenv.config();

// Initialiser l'application Express
const app = express();

// Connexion à la base de données
connectDB();

// Middleware
app.use(cors());
app.use(bodyParser.json());  // Pour parser le corps des requêtes JSON
app.use(cookieParser());     // Pour parser les cookies
app.use(morgan('dev'));      // Loguer les requêtes HTTP

// Routes
app.use('/api', userRoutes);

// Middleware pour gestion des erreurs
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Une erreur est survenue sur le serveur.' });
});

// Lancer le serveur
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Serveur démarré sur http://localhost:${PORT}`);
});
