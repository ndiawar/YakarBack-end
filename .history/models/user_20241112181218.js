const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');  // Pour le hachage du mot de passe

// Définir le schéma de l'utilisateur
const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  secretCode: {
    type: String,  // Le code secret, que vous pouvez générer lors de la création de l'utilisateur
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Avant de sauvegarder un utilisateur, hacher le mot de passe
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();  // Si le mot de passe n'est pas modifié, on n'a pas besoin de le hacher

  try {
    // Hacher le mot de passe avec un salt de 10 tours
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (err) {
    next(err);
  }
});

// Méthode pour comparer les mots de passe (utilisée pour la connexion)
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model('User', userSchema);

module.exports = User;
