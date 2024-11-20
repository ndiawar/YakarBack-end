const express = require('express');
const bodyParser = require('body-parser');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');
const userRoutes = require('./routes/userRoutes');

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
