import bcrypt from 'bcryptjs';  // Assurez-vous d'importer bcryptjs ou bcrypt
import jwt from 'jsonwebtoken';
import User from '../models/User';  // Modèle utilisateur, à ajuster selon votre projet


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


export const loginUser = async (req, res) => {
  try {
    // Récupérer les valeurs envoyées dans le corps de la requête
    const { email, password, secretCode } = req.body;

    // Vérifier si l'email et le mot de passe sont fournis
    if (email && password) {
      // Chercher l'utilisateur par email, inclure le mot de passe dans la requête
      const user = await User.findOne({ email }).select('+authentication.password');
      if (!user) {
        return res.status(400).json({ message: 'Utilisateur non trouvé.' });
      }

      // Affichage pour débogage, pour vérifier le mot de passe et l'utilisateur
      console.log('Utilisateur trouvé:', user);
      console.log('Mot de passe envoyé:', password);
      console.log('Mot de passe stocké:', user.authentication.password);

      // Comparaison du mot de passe envoyé avec le mot de passe haché
      const passwordMatch = await bcrypt.compare(password.trim(), user.authentication.password);
      if (!passwordMatch) {
        return res.status(401).json({ message: 'Mot de passe incorrect.' });
      }

      // Générer un token JWT avec les rôles de l'utilisateur
      const token = jwt.sign(
        { id: user._id, roles: user.roles },  // Inclure les rôles dans le payload du token
        process.env.APP_SECRET, 
        { expiresIn: '1h' }  // Durée d'expiration du token (1h)
      );

      // Envoyer le token dans un cookie avec un flag httpOnly pour plus de sécurité
      res.cookie('AUTH_COOKIE', token, { httpOnly: true });

      // Répondre avec un message de succès et les informations de l'utilisateur
      return res.status(200).json({ message: 'Connexion réussie.', user });

    } else if (secretCode) {
      // Si un code secret est fourni, rechercher l'utilisateur avec ce code
      const user = await User.findOne({ 'authentication.secretCode': secretCode });
      if (!user) {
        return res.status(400).json({ message: 'Utilisateur non trouvé.' });
      }

      // Générer un token JWT pour l'utilisateur avec le code secret
      const token = jwt.sign(
        { id: user._id, roles: user.roles },  // Inclure les rôles dans le payload du token
        process.env.APP_SECRET, 
        { expiresIn: '1h' }  // Durée d'expiration du token (1h)
      );

      // Envoyer le token dans un cookie avec un flag httpOnly pour plus de sécurité
      res.cookie('AUTH_COOKIE', token, { httpOnly: true });

      // Répondre avec un message de succès et les informations de l'utilisateur
      return res.status(200).json({ message: 'Connexion réussie.', user });

    } else {
      // Si ni l'email et le mot de passe, ni le code secret sont fournis
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
