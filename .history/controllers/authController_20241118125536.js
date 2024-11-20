import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/user.js';

// Inscription d'un utilisateur
export const registerUser = async (req, res) => {
  const { name, email, password, telephone, adresse, photo } = req.body;

  // Vérification des champs obligatoires
  if (!name || !email || !password || !telephone || !adresse) {
    return res
      .status(400)
      .json({ message: 'Tous les champs obligatoires (nom, email, mot de passe, téléphone, adresse) doivent être renseignés.' });
  }

  try {
    // Vérifier si l'utilisateur existe déjà avec l'email ou le téléphone
    const userExists = await User.findOne({ $or: [{ email }, { telephone }] });
    if (userExists) {
      return res.status(400).json({ message: 'Un utilisateur avec cet email ou ce téléphone existe déjà.' });
    }

    // Hacher le mot de passe
    const hashedPassword = await bcrypt.hash(password, 12);

    // Générer un code secret unique
    let secretCode;
    let isUnique = false;
    while (!isUnique) {
      secretCode = Math.floor(1000 + Math.random() * 9000); // Génère un nombre aléatoire à 4 chiffres
      const codeExists = await User.findOne({ "authentication.secretCode": secretCode });
      if (!codeExists) {
        isUnique = true; // Si le code n'existe pas, il est validé comme unique
      }
    }

    // Création du nouvel utilisateur
    const newUser = new User({
      name,
      email,
      telephone,
      adresse,
      photo, // Optionnel, peut être vide
      authentication: {
        password: hashedPassword,
        secretCode,
      },
    });

    // Enregistrement dans la base de données
    await newUser.save();

    // Réponse au client
    res.status(201).json({
      message: 'Utilisateur créé avec succès.',
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        telephone: newUser.telephone,
        adresse: newUser.adresse,
        photo: newUser.photo || null,
        role: newUser.roles,
        status: newUser.status,
        secretCode: newUser.authentication.secretCode, // Inclure le code secret dans la réponse
        createdAt: newUser.createdAt,
      },
    });
  } catch (error) {
    console.error('Erreur lors de la création de l\'utilisateur :', error);
    res.status(500).json({ message: 'Une erreur est survenue. Veuillez réessayer plus tard.' });
  }
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
      // console.log('Utilisateur trouvé:', user);
      // console.log('Mot de passe envoyé:', password);
      // console.log('Mot de passe stocké:', user.authentication.password);

      // Comparaison du mot de passe
      const passwordMatch = await bcrypt.compare(password.trim(), user.authentication.password);
      // console.log("Mot de passe envoyé après trim: ", password.trim());
      // console.log("Comparaison résultat: ", passwordMatch); // Log du résultat de la comparaison

      if (!passwordMatch) {
        // console.log('Mot de passe incorrect. Comparaison échouée.');
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
