import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Donnees from './models/data.js'; // Assurez-vous que le chemin est correct
import connectDB from '../config/db.js';


dotenv.config(); // Charger les variables d'environnement

dotenv.config();

// Connexion à MongoDB
connectDB();

// Génération de données aléatoires
const generateRandomData = () => {
  const randomTemperature = (Math.random() * 15 + 20).toFixed(1); // Température entre 20°C et 35°C
  const randomHumidity = Math.floor(Math.random() * 41 + 40); // Humidité entre 40% et 80%
  const randomBoolean = () => Math.random() < 0.5; // True ou False
  const randomHour = () => `${Math.floor(Math.random() * 24).toString().padStart(2, '0')}:${Math.floor(Math.random() * 60).toString().padStart(2, '0')}`;

  return {
    date: new Date(),
    heure: randomHour(),
    temperature: parseFloat(randomTemperature),
    humidite: randomHumidity,
    ventiloActive: randomBoolean(),
    buzzer: randomBoolean(),
    signal: randomBoolean(),
    moyTemp: parseFloat(randomTemperature), // Moyenne simulée (peut être ajustée)
    moyhum: randomHumidity, // Moyenne simulée (peut être ajustée)
  };
};

// Générer 100 données
const seedData = Array.from({ length: 100 }, generateRandomData);

// Fonction pour insérer les données
const seedDatabase = async () => {
  try {
    await Donnees.deleteMany(); // Nettoyer la collection avant d'insérer de nouvelles données
    console.log('Collection Donnees nettoyée.');

    await Donnees.insertMany(seedData);
    console.log('100 données générées et insérées avec succès.');
    process.exit(); // Quitter le processus après insertion
  } catch (error) {
    console.error('Erreur lors de l\'insertion des données :', error.message);
    process.exit(1); // Quitter avec une erreur
  }
};

// Exécuter les fonctions
connectDB().then(() => seedDatabase());
