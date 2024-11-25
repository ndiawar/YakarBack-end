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
    type: Number,
    required: true,
    unique: true,
  },
  adresse: {
    type: String,
    required: true,
  },
  photo: {
    type: String,
    required: false,
  },
  status: {
    type: Boolean,
    default: true,
  },
  authentication: {
    password: {
      type: String,
      required: true,
      select: false,
    },
    access_token: {
      type: String,
      select: false,
    },
    secretCode: {
      type: Number, // Rendre conforme à une chaîne de 4 chiffres
      required: true,
      unique: true,
    },
  },
  roles: {
    type: [String],
    enum: ["admin", "user"],
    default: "user",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  date_modification: {
    type: Date,
    default: null,
  },
});

// Méthode pour comparer le code secret
UserSchema.methods.validatePassword = async function(password) {
  return bcrypt.compare(password, this.password); // Comparer les mots de passe
};

const User = mongoose.model('User', UserSchema);

export default User;
