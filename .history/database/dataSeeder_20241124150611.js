import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { faker } from '@faker-js/faker';
import connectDB from '../config/db.js';
import Donnees from '../models/data.js'; // Assurez-vous que ce chemin est correct

dotenv.config(); // Charger les variables d'environnement

// Connexion à MongoDB
connectDB();

// Générer des données aléatoires pour chaque jour entre janvier et décembre 2024
const generateRandomData = (date, heure) => {
  return {
    date: date,
    heure: heure, // Heure donnée
    temperature: faker.number.float({ min: 20, max: 35, precision: 0.1 }), // Température entre 20°C et 35°C
    humidite: faker.number.int({ min: 40, max: 80 }), // Humidité entre 40% et 80%
    ventiloActive: faker.datatype.boolean(), // true ou false
    buzzer: faker.datatype.boolean(), // true ou false
    signal: faker.datatype.boolean(), // true ou false
    moyTemp: faker.number.float({ min: 20, max: 35, precision: 0.1 }), // Température moyenne
    moyhum: faker.number.int({ min: 40, max: 80 }), // Humidité moyenne
  };
};

// Générer des données pour une période allant de janvier 2024 à décembre 2024
const generateDataForDateRange = () => {
  const data = [];
  const startDate = new Date('2024-01-01'); // Commencer à partir de janvier 2024
  const endDate = new Date('2024-12-31'); // Fin en décembre 2024

  let currentDate = new Date(startDate);

  // Nombre de données souhaitées (par exemple 500)
  const totalDataCount = 500;

  while (data.length < totalDataCount) {
    // Vérifier si la date actuelle est dans la période souhaitée
    if (currentDate >= startDate && currentDate <= endDate) {
      // Générer les 3 entrées pour chaque jour à 10h, 14h, 17h
      const heures = ['10:00', '14:00', '17:00'];

      heures.forEach((heure) => {
        if (data.length < totalDataCount) {
          const dataEntry = generateRandomData(currentDate, heure);
          data.push(dataEntry);
        }
      });
    }

    // Passer au jour suivant
    currentDate.setDate(currentDate.getDate() + 1);
  }

  return data;
};

// Fonction pour insérer les données
const seedDatabase = async () => {
  try {
    // Nettoyer la collection avant d'insérer de nouvelles données
    await Donnees.deleteMany();
    console.log('Collection Donnees nettoyée.');

    // Générer les données pour la période souhaitée
    const seedData = generateDataForDateRange();

    // Insérer les données générées
    await Donnees.insertMany(seedData);
    console.log('500 données générées et insérées avec succès.');

    mongoose.connection.close(); // Fermer la connexion à MongoDB
  } catch (error) {
    console.error('Erreur lors de l\'insertion des données :', error.message);
    mongoose.connection.close(); // Fermer la connexion en cas d'erreur
  }
};

// Exécuter le script
seedDatabase();
