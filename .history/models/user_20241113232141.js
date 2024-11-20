import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

// Définir le schéma de l'utilisateur avec un sous-objet 'authentication'
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
      select: false,  // On ne veut pas que le mot de passe soit renvoyé par défaut
    },
    access_token: {
      type: String,
      select: false,  // Idem pour le token
    },
    secretCode: {
      type: String,
      required: true, // Le code secret pour l'authentification
    },
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Avant de sauvegarder un utilisateur, hacher le mot de passe
UserSchema.pre('save', async function (next) {
  if (!this.isModified('authentication.password')) return next(); // Si le mot de passe n'est pas modifié, on n'a pas besoin de le hacher

  try {
    // Hacher le mot de passe avec un salt de 10 tours
    const salt = await bcrypt.genSalt(10);
    this.authentication.password = await bcrypt.hash(this.authentication.password, salt);
    next();
  } catch (err) {
    next(err);
  }
});

// Méthode pour comparer les mots de passe (utilisée pour la connexion)
UserSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.authentication.password);
};

// Méthode pour comparer le code secret (utilisée pour l'authentification avec le code)
UserSchema.methods.matchSecretCode = function (enteredCode) {
  return enteredCode === this.authentication.secretCode;
};

const User = mongoose.model('User', UserSchema);

export default User;
