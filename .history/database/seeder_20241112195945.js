const mongoose = require('mongoose');
const { faker } = require('@faker-js/faker');  // Changer cette ligne
const bcrypt = require('bcryptjs');
const User = require('../models/user');  // Assurez-vous que le chemin est correct
const dotenv = require('dotenv');

// Charger les variables d'environnement
dotenv.config();

// Connexion à la base de données MongoDB
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => {
  console.log('Connexion réussie à MongoDB');
})
.catch(err => {
  console.log('Erreur de connexion', err);
  process.exit(1); // Si la connexion échoue, on arrête l'exécution
});

// Générer 100 utilisateurs avec Faker.js et hasher les mots de passe
const generateUsers = async (num) => {
  const users = [];

  for (let i = 0; i < num; i++) {
    const password = 'password123';  // Mot de passe à hasher
    const hashedPassword = await bcrypt.hash(password, 10);  // Hasher le mot de passe avec bcrypt

    users.push({
      name: faker.name.findName(),  // Générer un nom aléatoire
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
    await User.insertMany(users);  // Insérer les utilisateurs en masse
    console.log('100 utilisateurs générés et insérés avec succès');
    mongoose.connection.close();  // Fermer la connexion à MongoDB
  } catch (error) {
    console.error('Erreur lors de l\'insertion des utilisateurs :', error);
    mongoose.connection.close();
  }
};

// Exécution du script d'insertion
insertUsers();
