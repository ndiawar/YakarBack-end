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
    },
  },
  roles: {
    type: [String], // Exemple : ['admin', 'user']
    default: ['user'], // Par défaut, chaque utilisateur a le rôle 'user'
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});



// Méthode pour comparer le code secret
UserSchema.methods.matchSecretCode = function (enteredCode) {
  return enteredCode === this.authentication.secretCode;
};

const User = mongoose.model('User', UserSchema);

export default User;
