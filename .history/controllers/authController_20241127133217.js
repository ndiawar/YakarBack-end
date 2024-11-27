import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/user.js';
import { logAction } from './historiqueController.js'; // Importer la fonction logAction


// Inscription d'un utilisateur
export const registerUser = async (req, res) => {
  const { name, email, password, telephone, adresse, photo } = req.body;

  // Vérification des champs obligatoires
  if (!name || !email || !password || !telephone || !adresse) {
    return res
      .status(400)
      .json({ message: 'Tous les champs obligatoires (nom, email, mot de passe, téléphone, adresse) doivent être renseignés.' });
  }

  // Vérification du format de l'email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ message: 'Email invalide. Veuillez entrer un email valide.' });
  }

  // Vérification du format du téléphone
  const phoneRegex = /^(70|75|76|77|78)[0-9]{7}$/;
  if (!phoneRegex.test(telephone)) {
    return res.status(400).json({
      message: 'Téléphone invalide. Le numéro doit commencer par 70, 75, 76, 77 ou 78 et contenir 9 chiffres.',
    });
  }

  // Vérification de la longueur du mot de passe
  if (password.length < 8) {
    return res.status(400).json({ message: 'Le mot de passe doit contenir au moins 8 caractères.' });
  }
  
  if (!/[A-Z]/.test(password)) {
    return res.status(400).json({ message: 'Le mot de passe doit contenir au moins une majuscule.' });
  }
  
  if (!/[0-9]/.test(password)) {
    return res.status(400).json({ message: 'Le mot de passe doit contenir au moins un chiffre.' });
  }
  
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    return res.status(400).json({ message: 'Le mot de passe doit contenir au moins un caractère spécial.' });
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

    // Récupérer l'utilisateur connecté (celui qui effectue l'inscription)
    const token = req.cookies.AUTH_COOKIE || req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(403).json({ message: 'Token non trouvé, utilisateur non authentifié.' });
    }

    // Décoder le token pour obtenir l'ID de l'utilisateur connecté
    const decoded = jwt.verify(token, process.env.APP_SECRET);
    const loggedInUserId = decoded.id;

    // Enregistrer l'action d'inscription dans l'historique
    await logAction(loggedInUserId, `Inscription d'un nouvel utilisateur (ID: ${newUser._id})`);

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
    // Erreur générique mais spécifique
    return res.status(500).json({ message: 'Une erreur est survenue. Veuillez réessayer plus tard.' });

    // // Gestion des erreurs spécifiques
    // if (error.name === 'MongoError') {
    //   return res.status(500).json({ message: 'Problème d\'accès à la base de données. Veuillez réessayer.' });
    // } else if (error.message.includes('Validation')) {
    //   return res.status(400).json({ message: 'Données invalides. Veuillez vérifier les champs.' });
    // } else if (error.name === 'JsonWebTokenError') {
    //   return res.status(403).json({ message: 'Le token est invalide ou expiré.' });
    // } else {
      
    // }
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

// Connexion avec email et mot de passe
export const loginWithEmail = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email et mot de passe requis.' });
    }

    const user = await User.findOne({ email }).select('+authentication.password');
    if (!user) {
      return res.status(404).json({ message: 'Utilisateur non trouvé avec cet email.' });
    }

    const passwordMatch = await bcrypt.compare(password.trim(), user.authentication.password);
    if (!passwordMatch) {
      return res.status(401).json({ message: 'Mot de passe incorrect.' });
    }

    const token = jwt.sign({ id: user._id, roles: user.roles }, process.env.APP_SECRET, { expiresIn: '1h' });

    res.cookie('AUTH_COOKIE', token, { httpOnly: true });
    await logAction(user._id, 'Connexion réussie (email)');

    return res.status(200).json({
      message: 'Connexion réussie.',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        telephone: user.telephone,
        adresse: user.adresse,
        photo: user.photo || null,
        role: user.roles[0],
        status: user.status,
        createdAt: user.createdAt,
        date_modification: user.date_modification
      },
    });
  } catch (error) {
    console.error('Erreur connexion email:', error);
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
};

// Connexion avec code secret
export const loginWithSecretCode = async (req, res) => {
  try {
    const { secretCode } = req.body;

    if (!secretCode) {
      return res.status(400).json({ message: 'Code secret requis.' });
    }

    const user = await User.findOne({ 'authentication.secretCode': secretCode });
    if (!user) {
      return res.status(404).json({ message: 'Utilisateur non trouvé avec ce code secret.' });
    }

    const token = jwt.sign({ id: user._id, roles: user.roles }, process.env.APP_SECRET, { expiresIn: '1h' });

    res.cookie('AUTH_COOKIE', token, { httpOnly: true });
    await logAction(user._id, 'Connexion réussie (code secret)');

    return res.status(200).json({
      message: 'Connexion réussie.',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        telephone: user.telephone,
        adresse: user.adresse,
        photo: user.photo || null,
        role: user.roles[0],
        status: user.status,
        createdAt: user.createdAt,
        date_modification: user.date_modification
      },
    });
  } catch (error) {
    console.error('Erreur connexion code secret:', error);
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
};


// Déconnexion d'un utilisateur
export const logoutUser = (req, res) => {
  res.clearCookie('AUTH_COOKIE');
  res.status(200).json({ message: 'Déconnexion réussie.' });
};
// Vérifier l'existence de l'email dans la base de données
export const checkEmailExistence = async (req, res) => {
  try {
    const { email, password } = req.body; // Récupérer l'email et le mot de passe

    if (!email) {
      return res.status(400).json({ message: 'Email requis pour la vérification.' });
    }

    // Chercher l'utilisateur dans la base de données par email
    const user = await User.findOne({ email });

    // Vérifier si l'utilisateur existe
    if (user) {
      if (password) {
        // Si le mot de passe est fourni, le comparer avec celui de l'utilisateur
        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (isPasswordValid) {
          return res.json({ exists: true, isValid: true }); // Email et mot de passe corrects
        } else {
          return res.status(401).json({ exists: true, isValid: false, message: 'Mot de passe incorrect.' });
        }
      }

      // Si le mot de passe n'est pas fourni, simplement confirmer que l'email existe
      return res.json({ exists: true });
    } else {
      return res.json({ exists: false, message: 'Email introuvable.' });
    }
  } catch (error) {
    // console.error('Erreur lors de la vérification de l'email :', error);
    return res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
};
