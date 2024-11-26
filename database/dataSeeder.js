import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { faker } from '@faker-js/faker';
import connectDB from '../config/db.js';
import Donnees from '../models/data.js'; // Assurez-vous que ce chemin est correct
import moment from 'moment';

dotenv.config(); // Charger les variables d'environnement

// Connexion à MongoDB
connectDB();

// Les heures spécifiques que tu veux enregistrer chaque jour
const heuresImportantes = ['20:40', '20:42', '20:46'];

// Générer des données aléatoires avec Faker pour une date et une heure spécifique
const generateRandomData = (date, heure) => {
  const formattedDate = moment(date).format('YYYY-MM-DD');
  return {
    date: formattedDate, // Utilise la date donnée
    heure: heure, // Utilise l'heure spécifique
    temperature: faker.number.float({ min: 20, max: 35, precision: 0.1 }), // Température entre 20°C et 35°C
    humidite: faker.number.int({ min: 40, max: 80 }), // Humidité entre 40% et 80%
    ventiloActive: faker.datatype.boolean(), // true ou false
    buzzer: faker.datatype.boolean(), // true ou false
    signal: faker.datatype.boolean(), // true ou false
    moyTemp: faker.number.float({ min: 20, max: 35, precision: 0.1 }), // Température moyenne
    moyhum: faker.number.int({ min: 40, max: 80 }), // Humidité moyenne
  };
};

// Générer des données pour chaque jour entre le 11 novembre et le 30 novembre
const seedData = () => {
  let data = [];
  const startDate = moment('2024-11-11'); // Début le 11 novembre 2024
  const endDate = moment('2024-11-30'); // Fin le 30 novembre 2024
  
  let currentDate = startDate.clone();

  // Générer des données pour chaque jour entre ces dates
  while (currentDate.isBefore(endDate)) {
    // Pour chaque heure importante, générer des données pour ce jour
    heuresImportantes.forEach(heure => {
      data.push(generateRandomData(currentDate, heure));
    });
    currentDate.add(1, 'day'); // Ajouter un jour à chaque itération
  }

  return data;
};

// Fonction pour insérer les données dans la base
const seedDatabase = async () => {
  try {
    // Nettoyer la collection avant d'insérer de nouvelles données
    await Donnees.deleteMany();
    console.log('Collection Donnees nettoyée.');

    // Insérer les données générées
    const seedDataArray = seedData();
    await Donnees.insertMany(seedDataArray);
    console.log(`${seedDataArray.length} données générées et insérées avec succès.`);

    mongoose.connection.close(); // Fermer la connexion à MongoDB
  } catch (error) {
    console.error('Erreur lors de l\'insertion des données :', error.message);
    mongoose.connection.close(); // Fermer la connexion en cas d'erreur
  }
};

// Exécuter le script
seedDatabase();
