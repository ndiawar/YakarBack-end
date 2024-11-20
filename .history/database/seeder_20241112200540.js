const mongoose = require('mongoose');
const { faker } = require('@faker-js/faker');
const bcrypt = require('bcryptjs');
const User = require('../models/user');  // Assurez-vous du bon chemin
const dotenv = require('dotenv');
const connectDB = require('../config/db'); // Importer la fonction de connexion

dotenv.config();  // Assurez-vous que dotenv est chargé

// Connexion à MongoDB via la fonction connectDB
connectDB();

// Générer 100 utilisateurs avec Faker.js et hasher les mots de passe
const generateUsers = async (num) => {
  const users = [];

  for (let i = 0; i < num; i++) {
    const password = 'password123';  // Mot de passe à hasher
    const hashedPassword = await bcrypt.hash(password, 10);  // Hasher le mot de passe avec bcrypt

    users.push({
      name: faker.person.fullName(),  // Générer un nom aléatoire
      email: faker.internet.email(),  // Générer un email aléatoire
      password: hashedPassword,  // Utiliser le mot de passe hashé
      secretCode: faker.random.numeric(5),  // Générer un code secret aléatoire
    });
  }

  return users;
};

// Insertion des utilisateurs dans MongoDB
const insertUsers = async () => {
  try {
    const users = await generateUsers(100);  // Générer 100 utilisateurs
    await user.insertMany(users);  // Insérer les utilisateurs en masse
    console.log('100 utilisateurs générés et insérés avec succès');
    mongoose.connection.close();  // Fermer la connexion à MongoDB
  } catch (error) {
    console.error('Erreur lors de l\'insertion des utilisateurs :', error);
    mongoose.connection.close();
  }
};

// Exécution du script d'insertion
insertUsers();
