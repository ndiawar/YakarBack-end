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

  if (email && password) {
    // Chercher l'utilisateur par email
    const user = await User.findOne({ email }).select('+authentication.password');
    if (!user) {
      return res.status(400).json({ message: 'Utilisateur non trouvé.' });
    }

    // Comparaison du mot de passe
    const passwordMatch = await bcrypt.compare(password, user.authentication.password);
    if (!passwordMatch) {
      return res.status(401).json({ message: 'Mot de passe incorrect.' });
    }

    // Générer un token JWT avec les rôles de l'utilisateur
    const token = jwt.sign(
      { id: user._id, roles: user.roles }, // Inclure les rôles dans le payload du token
      process.env.APP_SECRET, 
      { expiresIn: '1h' }
    );

    res.cookie('AUTH_COOKIE', token, { httpOnly: true });

    return res.status(200).json({ message: 'Connexion réussie.', user });
  }

  if (secretCode) {
    const user = await User.findOne({ 'authentication.secretCode': secretCode });
    if (!user) {
      return res.status(400).json({ message: 'Utilisateur non trouvé.' });
    }

    const token = jwt.sign(
      { id: user._id, roles: user.roles }, // Inclure les rôles
      process.env.APP_SECRET, 
      { expiresIn: '1h' }
    );

    res.cookie('AUTH_COOKIE', token, { httpOnly: true });

    return res.status(200).json({ message: 'Connexion réussie.', user });
  }

  return res.status(400).json({ message: 'Email et mot de passe ou code secret requis.' });
};



// Déconnexion d'un utilisateur
export const logoutUser = (req, res) => {
  res.clearCookie('AUTH_COOKIE');
  res.status(200).json({ message: 'Déconnexion réussie.' });
};
