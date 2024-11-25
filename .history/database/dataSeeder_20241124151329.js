import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { faker } from '@faker-js/faker';
import connectDB from '../config/db.js';
import Donnees from '../models/data.js'; // Assurez-vous que ce chemin est correct

dotenv.config(); // Charger les variables d'environnement

// Connexion à MongoDB
connectDB();

// Fonction pour générer des dates entre le 1er novembre et le 31 décembre
const generateDateBetweenNovDec = () => {
  const startDate = new Date(2024, 10, 1); // 1er novembre 2024
  const endDate = new Date(2024, 11, 31); // 31 décembre 2024
  const randomTimestamp = faker.date.between(startDate, endDate).getTime();
  return new Date(randomTimestamp);
};

// Fonction pour générer une heure au format "HH:mm"
const generateTime = () => {
  return faker.date.soon().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
};

// Fonction pour générer des données aléatoires avec Faker
const generateRandomData = () => {
  return {
    date: generateDateBetweenNovDec(), // Date entre début novembre et fin décembre
    heure: generateTime(), // Heure format "HH:mm"
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
