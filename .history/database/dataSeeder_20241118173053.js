import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { faker } from '@faker-js/faker';
import connectDB from '../config/db.js';
import Donnees from '../models/data.js'; // Assurez-vous que ce chemin est correct

dotenv.config(); // Charger les variables d'environnement

// Connexion à MongoDB
connectDB();

// Générer des données aléatoires avec Faker
const generateRandomData = () => {
  return {
    date: faker.date.recent(), // Date récente
    heure: faker.date
      .soon()
      .toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }), // Heure format "HH:mm"
    temperature: faker.number.float({ min: 20, max: 35, precision: 0.1 }), // Température entre 20°C et 35°C
    humidite: faker.number.int({ min: 40, max: 80 }), // Humidité entre 40% et 80%
    ventiloActive: faker.datatype.boolean(), // true ou false
    buzzer: faker.datatype.boolean(), // true ou false
    signal: faker.datatype.boolean(), // true ou false
    moyTemp: faker.number.float({ min: 20, max: 35, precision: 0.1 }), // Température moyenne
    moyhum: faker.number.int({ min: 40, max: 80 }), // Humidité moyenne
  };
};

// Générer 100 données
const seedData = Array.from({ length: 100 }, generateRandomData);

// Fonction pour insérer les données
const seedDatabase = async () => {
  try {
    // Nettoyer la collection avant d'insérer de nouvelles données
    await Donnees.deleteMany();
    console.log('Collection Donnees nettoyée.');

    // Insérer les données générées
    await Donnees.insertMany(seedData);
    console.log('100 données générées et insérées avec succès.');

    mongoose.connection.close(); // Fermer la connexion à MongoDB
  } catch (error) {
    console.error('Erreur lors de l\'insertion des données :', error.message);
    mongoose.connection.close(); // Fermer la connexion en cas d'erreur
  }
};

// Exécuter le script
seedDatabase();
