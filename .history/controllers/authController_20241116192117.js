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

  // Vérifier le hash
  console.log('Mot de passe haché:', hashedPassword);

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

// Vérifier le mot de passe

export const verifyPassword = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ message: 'Email et mot de passe requis.' });
    }
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Utilisateur non trouvé.' });
      }
      const isValid = await bcrypt.compare(password, user.authentication.password);
      if (!isValid) {
        return res.status(401).json({ message: 'Mot de passe incorrect.' });
      }
      // Générer un token JWT avec les rôles de l'utilisateur
      const token = jwt.sign(
        { id: user._id, roles: user.roles },
        process.env.APP_SECRET,
        { expiresIn: '1h' }
      );
      res.json({ token });
};

  // Connexion d'un utilisateur
  export const login = async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: 'Email et mot de passe requis.' });
      }
      const user = await User.findOne({ email });
      if (!user) {
        return res.status(400).json({ message: 'Utilisateur non trouvé.' });
      }
      const isValid = await bcrypt.compare(password, user.authentication.password);
      if (!isValid) {
        return res.status(401).json({ message: 'Mot de passe incorrect.' });
      }
      // Générer un token JWT avec les rôles de l'utilisateur
      const token = jwt.sign(
        { id: user._id, roles: user.roles },
        process.env.APP_SECRET,
        { expiresIn: '1h' }
      );
      res.json({ token });
      };
      

export const loginUser = async (req, res) => {
  try {
    const { email, password, secretCode } = req.body;

    if (email && password) {
      // Chercher l'utilisateur par email et inclure le mot de passe
      const user = await User.findOne({ email }).select('+authentication.password');
      if (!user) {
        return res.status(400).json({ message: 'Utilisateur non trouvé.' });
      }

      // Log pour vérifier les valeurs
      console.log('Utilisateur trouvé:', user);
      console.log('Mot de passe envoyé:', password);
      console.log('Mot de passe stocké:', user.authentication.password);

      // Comparaison du mot de passe
      const passwordMatch = await bcrypt.compare(password.trim(), user.authentication.password);
      console.log("Mot de passe envoyé après trim: ", password.trim());
      console.log("Comparaison résultat: ", passwordMatch); // Log du résultat de la comparaison

      if (!passwordMatch) {
        console.log('Mot de passe incorrect. Comparaison échouée.');
        return res.status(401).json({ message: 'Mot de passe incorrect.' });
      }

      // Générer le token JWT
      const token = jwt.sign(
        { id: user._id, roles: user.roles },
        process.env.APP_SECRET,
        { expiresIn: '1h' }
      );

      // Envoi du token dans un cookie sécurisé
      res.cookie('AUTH_COOKIE', token, { httpOnly: true });

      return res.status(200).json({ message: 'Connexion réussie.', user });

    } else if (secretCode) {
      const user = await User.findOne({ 'authentication.secretCode': secretCode });
      if (!user) {
        return res.status(400).json({ message: 'Utilisateur non trouvé.' });
      }

      const token = jwt.sign(
        { id: user._id, roles: user.roles },
        process.env.APP_SECRET,
        { expiresIn: '1h' }
      );

      res.cookie('AUTH_COOKIE', token, { httpOnly: true });

      return res.status(200).json({ message: 'Connexion réussie.', user });

    } else {
      return res.status(400).json({ message: 'Email et mot de passe ou code secret requis.' });
    }

  } catch (error) {
    console.error('Erreur lors de la tentative de connexion:', error);
    return res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
};


// Déconnexion d'un utilisateur
export const logoutUser = (req, res) => {
  res.clearCookie('AUTH_COOKIE');
  res.status(200).json({ message: 'Déconnexion réussie.' });
};
