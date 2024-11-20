import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  telephone: {
    type: Number, // Type nombre pour le téléphone
    required: true, // Champ obligatoire
    unique: true,
  },
  adresse: {
    type: String, // Adresse sous forme de chaîne de caractères
    required: true, // Champ obligatoire
  },
  photo: {
    type: String, // URL ou chemin de l'image stockée
    required: false, // La photo est optionnelle
  },
  status: {
    type: Boolean, // Booléen pour indiquer si l'utilisateur est actif ou non
    default: true, // Par défaut, l'utilisateur est actif
  },
  authentication: {
    password: {
      type: String,
      required: true,
      select: false, // Le mot de passe ne sera pas renvoyé par défaut
    },
    access_token: {
      type: String,
      select: false, // Le token d'accès ne sera pas renvoyé par défaut
    },
    secretCode: {
      type: String,
      required: true, // Le code secret pour l'authentification
      unique: true,
    },
  },
  roles: {
    type: [String], // Exemple : ['admin', 'user']
    enum: ["admin", "user"], // Définition des valeurs autorisées
    default: "user", // Valeur par défaut
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  date_modification: {
    type: Date, // Dernière modification
    default: null, // Par défaut, aucune date (sera remplie lorsqu'il y a une modification)
  },
});



// Méthode pour comparer le code secret
UserSchema.methods.matchSecretCode = function (enteredCode) {
  return enteredCode === this.authentication.secretCode;
};

const User = mongoose.model('User', UserSchema);

export default User;
