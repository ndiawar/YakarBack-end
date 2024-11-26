import mongoose from 'mongoose';
import { faker } from '@faker-js/faker';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import connectDB from '../config/db.js';
import User from '../models/user.js'; // Importer le modèle User

dotenv.config();

// Connexion à MongoDB
connectDB();

// Générer un numéro de téléphone sénégalais valide
const generateSenegalesePhoneNumber = () => {
  const prefixes = [70, 75, 76, 77, 78]; // Préfixes valides au Sénégal
  const prefix = prefixes[Math.floor(Math.random() * prefixes.length)]; // Choisir un préfixe aléatoire
  const suffix = faker.number.int({ min: 1000000, max: 9999999 }); // Générer les 7 chiffres restants
  return `${prefix}${suffix}`; // Retourner le numéro complet
};

// Générer 100 utilisateurs
const generateUsers = async (num) => {
  const users = [];

  for (let i = 0; i < num; i++) {
    const password = 'Passer@123!';
    const hashedPassword = await bcrypt.hash(password, 12);

    users.push({
      name: faker.person.fullName(),
      email: faker.internet.email(),
      telephone: generateSenegalesePhoneNumber(), // Utiliser la fonction pour générer un numéro valide
      adresse: faker.location.streetAddress(),
      authentication: {
        password: hashedPassword,
        secretCode: faker.number.int({ min: 1000, max: 9999 }).toString(), // Code secret de 4 chiffres
      },
      photo: faker.image.avatar(),
    });
  }

  return users;
};

// Insérer les utilisateurs dans la base de données
const insertUsers = async () => {
  try {
    const users = await generateUsers(100);
    await User.insertMany(users); // Insérer les utilisateurs
    console.log('100 utilisateurs générés et insérés avec succès');
    mongoose.connection.close();
  } catch (error) {
    console.error('Erreur lors de l\'insertion des utilisateurs :', error);
    mongoose.connection.close();
  }
};

// Exécuter le script
insertUsers();
