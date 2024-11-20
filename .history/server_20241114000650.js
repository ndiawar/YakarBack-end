import express from 'express';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';
import cors from 'cors';
import connectDB from './config/db.js';  // N'oublie pas d'ajouter l'extension .js
import userRoutes from './routes/userRoutes.js';  // N'oublie pas d'ajouter l'extension .js


// Charger les variables d'environnement
dotenv.config();

// Initialiser l'application Express
const app = express();

// Connexion à la base de données
connectDB();

// Middleware
app.use(cors());
app.use(bodyParser.json()); // Pour parser le corps des requêtes JSON

// Routes
app.use('/api', userRoutes);

// Lancer le serveur
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Serveur démarré sur http://localhost:${PORT}`);
});
