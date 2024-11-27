import bcrypt from 'bcryptjs';
import User from '../models/user.js';
import { logAction } from './historiqueController.js'; // Importer la fonction logAction



// Récupérer les utilisateurs (actifs ou tous selon le paramètre)
// Récupérer les utilisateurs (actifs ou tous selon le paramètre)
export const getAllUsers = async (req, res) => {
  const { active } = req.query; // Récupérer le paramètre "active" depuis la requête
  const filter = active === 'true' ? { status: true } : {}; // Filtre pour les utilisateurs actifs
  
  try {
    const users = await User.find(filter).sort({ createdAt: -1 }); // Tri par date de création, du plus récent au plus ancien
    res.status(200).json({ users });
  } catch (err) {
    res.status(500).json({ message: 'Erreur lors de la récupération des utilisateurs', error: err.message });
  }
};


// Récupérer un utilisateur par son ID
export const getUserById = async (req, res) => {
  const userId = req.params.id;

  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'Utilisateur non trouvé' });
    }
    res.status(200).json({ user });
  } catch (err) {
    res.status(500).json({ message: 'Erreur lors de la récupération de l\'utilisateur', error: err.message });
  }
};

// Mettre à jour un utilisateur
// Mettre à jour un utilisateur
export const updateUser = async (req, res) => {
  const userId = req.params.id;
  const { name, email, password, telephone, adresse, photo, status, roles, secretCode } = req.body;

  try {
    // Rechercher l'utilisateur par ID
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'Utilisateur non trouvé' });
    }

    // Vérification de l'unicité de l'email si modifié
    if (email && email !== user.email) {
      const emailExists = await User.findOne({ email });
      if (emailExists) {
        return res.status(400).json({ message: 'Cet email est déjà utilisé par un autre utilisateur.' });
      }
      user.email = email;
    }

    // Vérification de l'unicité du téléphone si modifié
    if (telephone && telephone !== user.telephone) {
      const phoneExists = await User.findOne({ telephone });
      if (phoneExists) {
        return res.status(400).json({ message: 'Ce numéro de téléphone est déjà utilisé par un autre utilisateur.' });
      }
      user.telephone = telephone;
    }

    // Vérification de l'unicité du code secret si modifié
    if (secretCode && secretCode !== user.authentication.secretCode) {
      const codeExists = await User.findOne({ 'authentication.secretCode': secretCode });
      if (codeExists) {
        return res.status(400).json({ message: 'Ce code secret est déjà utilisé par un autre utilisateur.' });
      }
      user.authentication.secretCode = secretCode;
    }

    // Mise à jour des autres champs si fournis
    user.name = name || user.name;
    user.adresse = adresse || user.adresse;
    user.photo = photo || user.photo;
    user.status = status !== undefined ? status : user.status; // Gestion booléenne
    user.roles = roles || user.roles;

    // Mise à jour du mot de passe si fourni
    if (password) {
      const hashedPassword = await bcrypt.hash(password, 12); // Hachage du mot de passe
      user.authentication.password = hashedPassword;
    }

    // Mise à jour de la date de modification
    user.date_modification = new Date();

    // Sauvegarder les changements
    await user.save();

    // // Récupérer l'utilisateur connecté via le token
    // const token = req.cookies.AUTH_COOKIE || req.headers.authorization?.split(' ')[1];
    // if (!token) {
    //   return res.status(403).json({ message: 'Token non trouvé, utilisateur non authentifié.' });
    // }

    // // Décoder le token pour obtenir l'ID de l'utilisateur connecté
    // const decoded = jwt.verify(token, process.env.APP_SECRET);
    // const loggedInUserId = decoded.id;

    // // Enregistrer l'action dans l'historique
    // await logAction(loggedInUserId, `Mise à jour de l'utilisateur (ID: ${user._id})`);

    // Réponse au client
    res.status(200).json({ message: 'Utilisateur mis à jour avec succès', user });
  } catch (err) {
    // Gestion des erreurs
    console.error('Erreur lors de la mise à jour de l\'utilisateur:', err);
    res.status(500).json({ message: 'Erreur lors de la mise à jour de l\'utilisateur', error: err.message });
  }
};


// Désactiver un utilisateur en modifiant son statut
export const deleteUser = async (req, res) => {
  const userId = req.params.id;

  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'Utilisateur non trouvé' });
    }

    // Changer le statut de l'utilisateur à `false` pour indiquer qu'il est désactivé
    user.status = false;
    user.date_modification = new Date(); // Mettre à jour la date de modification
    await user.save();

    // Récupérer l'utilisateur connecté via le token
    // const token = req.cookies.AUTH_COOKIE || req.headers.authorization?.split(' ')[1];
    // if (!token) {
    //   return res.status(403).json({ message: 'Token non trouvé, utilisateur non authentifié.' });
    // }

    // Décoder le token pour obtenir l'ID de l'utilisateur connecté
    // const decoded = jwt.verify(token, process.env.APP_SECRET);
    // const loggedInUserId = decoded.id;

    // Enregistrer l'action dans l'historique
    // await logAction(loggedInUserId, `Désactivation de l'utilisateur (ID: ${user._id})`);

    res.status(200).json({ message: 'Utilisateur désactivé avec succès', user });
  } catch (err) {
    res.status(500).json({ message: 'Erreur lors de la désactivation de l\'utilisateur', error: err.message });
  }
};

// Changer le rôle de l'utilisateur (switch automatique entre "admin" et "user")
export const toggleUserRole = async (req, res) => {
  const userId = req.params.id;

  try {
    // Rechercher l'utilisateur par ID
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'Utilisateur non trouvé' });
    }

    // Basculer le rôle
    const newRole = user.roles.includes("admin") ? "user" : "admin";
    user.roles = [newRole]; // Met à jour le rôle en remplaçant les existants
    user.date_modification = new Date(); // Met à jour la date de modification

    // Enregistrer les modifications
    await user.save();

    // // Récupérer l'utilisateur connecté via le token
    // const token = req.cookies.AUTH_COOKIE || req.headers.authorization?.split(' ')[1];
    // if (!token) {
    //   return res.status(403).json({ message: 'Token non trouvé, utilisateur non authentifié.' });
    // }

    // Décoder le token pour obtenir l'ID de l'utilisateur connecté
    // const decoded = jwt.verify(token, process.env.APP_SECRET);
    // const loggedInUserId = decoded.id;

    // Enregistrer l'action dans l'historique
    // await logAction(loggedInUserId, `Changement de rôle de l'utilisateur (ID: ${user._id}) : ${newRole}`);

    // Réponse au client
    res.status(200).json({
      message: `Rôle utilisateur mis à jour avec succès à "${newRole}"`,
      user,
    });
  } catch (err) {
    res.status(500).json({
      message: 'Erreur lors de la mise à jour du rôle utilisateur',
      error: err.message,
    });
  }
};

export const searchUsers = async (req, res) => {
  const { search, active } = req.query;

  try {
    const query = {};
    
    // Si un paramètre "search" est fourni (par exemple un email ou un nom)
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    // Filtre par statut si "active" est spécifié
    if (active !== undefined) {
      query.status = active === 'true';
    }

    const users = await User.find(query);
    return res.status(200).json({ users });
  } catch (error) {
    console.error('Erreur lors de la recherche des utilisateurs:', error);
    return res.status(500).json({ message: 'Erreur lors de la recherche des utilisateurs.' });
  }
};
