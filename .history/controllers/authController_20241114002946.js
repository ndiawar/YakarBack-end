import Express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/user'; // Assure-toi que c'est le bon chemin vers ton modèle

const registerUser = async (req, res) => {
  const { name, email, password, secretCode } = req.body;

  if (!name || !email || !password || !secretCode) {
    return res.status(400).send({ message: 'Required name, email, password, and secretCode' });
  }

  // Check if the user already exists
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return res.status(400).send({ message: 'User with this email already exists.' });
  }

  // Create new user
  const hashedPassword = await bcrypt.hash(password, 12);

  const newUser = new User({
    name,
    email,
    authentication: {
      password: hashedPassword,
      secretCode,
      access_token: '', // Le token sera généré après la connexion
    },
  });

  await newUser.save();

  return res.status(201).send(newUser);
};

const loginUser = async (req, res) => {
  const { email, password, secretCode } = req.body;

  if (!email || (!password && !secretCode)) {
    return res.status(400).send({ message: 'Required email and either password or secretCode' });
  }

  // Trouver l'utilisateur
  const user = await User.findOne({ email }).select('+authentication.password +authentication.secretCode');
  if (!user) {
    return res.status(400).send({ message: 'User not found, please sign up first' });
  }

  // Si on a un mot de passe, vérifier qu'il correspond
  if (password) {
    const passwordMatch = await bcrypt.compare(password, user.authentication.password);
    if (!passwordMatch) {
      return res.status(401).send({ message: 'Invalid credentials' });
    }
  }

  // Si on a un code secret, vérifier qu'il correspond
  if (secretCode) {
    const secretCodeMatch = user.matchSecretCode(secretCode);
    if (!secretCodeMatch) {
      return res.status(401).send({ message: 'Invalid secret code' });
    }
  }

  // Générer un access token JWT
  const accessToken = jwt.sign(
    { userId: user._id },
    process.env.JWT_SECRET, // Utilise une variable d'environnement pour le secret
    { expiresIn: '1h' }
  );

  // Ajouter le token à l'utilisateur et sauvegarder
  user.authentication.access_token = accessToken;
  await user.save();

  // Envoyer le token dans un cookie HttpOnly pour la sécurité
  res.cookie('AUTH_COOKIE', accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production', // HTTPS uniquement en production
    maxAge: 3600000, // 1 heure
  });

  return res.status(200).send({ message: 'Login successful', user });
};

// Middleware de validation de l'authentification avec le token
const authMiddleware = async (req, res, next) => {
  const token = req.cookies.AUTH_COOKIE || req.headers['authorization']?.split(' ')[1];
  if (!token) {
    return res.status(401).send({ message: 'You must be logged in' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).send({ message: 'Invalid or expired token' });
  }
};

// Logout
const logoutUser = (req, res) => {
  res.clearCookie('AUTH_COOKIE');
  return res.status(200).send({ message: 'Logout successful' });
};

export { registerUser, loginUser, authMiddleware, logoutUser };
