import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/user.js';

// Inscription d'un utilisateur
export const registerUser = async (req, res) => {
  const { name, email, password, secretCode } = req.body;

  if (!name || !email || !password || !secretCode) {
    return res.status(400).json({ message: 'Nom, email, mot de passe et code secret requis.' });
  }

  const userExists = await User.findOne({ email });
  if (userExists) {
    return res.status(400).json({ message: 'Utilisateur déjà existant.' });
  }

  // Hacher le mot de passe
  const hashedPassword = await bcrypt.hash(password, 12);

  const newUser = new User({
    name,
    email,
    authentication: {
      password: hashedPassword,
      secretCode,
    },
  });

  await newUser.save();

  res.status(201).json({ message: 'Utilisateur créé avec succès.', user: newUser });
};

// Connexion d'un utilisateur
export const loginUser = async (req, res) => {
  const { email, password, secretCode } = req.body;

  console.log('Email:', email);
  console.log('Password:', password);
  console.log('Secret Code:', secretCode);

  if (!email || (!password && !secretCode)) {
    return res.status(400).json({ message: 'Email et mot de passe ou code secret requis.' });
  }

  const user = await User.findOne({ email }).select('+authentication.password +authentication.secretCode');
  if (!user) {
    console.log('Utilisateur non trouvé');
    return res.status(400).json({ message: 'Utilisateur non trouvé.' });
  }

  let passwordMatch = false;

  if (password) {
    console.log('Comparaison du mot de passe...');
    passwordMatch = await bcrypt.compare(password, user.authentication.password);
  } else if (secretCode) {
    console.log('Comparaison du code secret...');
    passwordMatch = user.matchSecretCode(secretCode);
  }

  if (!passwordMatch) {
    console.log('Identifiants invalides');
    return res.status(401).json({ message: 'Identifiants invalides.' });
  }

  // Générer un token JWT
  const token = jwt.sign({ id: user._id }, process.env.APP_SECRET, { expiresIn: '1h' });
  console.log('Token généré:', token);

  // Sauvegarder le token dans un cookie
  res.cookie('AUTH_COOKIE', token, { httpOnly: true });

  res.status(200).json({ message: 'Connexion réussie.', user });
};

// Déconnexion d'un utilisateur
export const logoutUser = (req, res) => {
  res.clearCookie('AUTH_COOKIE');
  res.status(200).json({ message: 'Déconnexion réussie.' });
};
