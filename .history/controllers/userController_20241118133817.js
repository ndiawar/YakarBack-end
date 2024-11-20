import User from '../models/user.js';
import bcrypt from 'bcryptjs';

// Récupérer tous les utilisateurs
export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find();
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
export const updateUser = async (req, res) => {
  const userId = req.params.id;
  const { name, email, password, telephone, adresse, photo, status, roles } = req.body;

  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'Utilisateur non trouvé' });
    }

    // Mettre à jour les champs de l'utilisateur si fournis
    user.name = name || user.name;
    user.email = email || user.email;
    user.telephone = telephone || user.telephone;
    user.adresse = adresse || user.adresse;
    user.photo = photo || user.photo;
    user.status = status !== undefined ? status : user.status; // Gestion booléenne
    user.roles = roles || user.roles;

    if (password) {
      // Si un mot de passe est fourni, il faut le hacher avant de le sauvegarder
      const hashedPassword = await bcrypt.hash(password, 12);
      user.authentication.password = hashedPassword;
    }

    // Sauvegarder les changements
    user.date_modification = new Date(); // Mettre à jour la date de modification
    await user.save();

    res.status(200).json({ message: 'Utilisateur mis à jour avec succès', user });
  } catch (err) {
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

    res.status(200).json({ message: 'Utilisateur désactivé avec succès', user });
  } catch (err) {
    res.status(500).json({ message: 'Erreur lors de la désactivation de l\'utilisateur', error: err.message });
  }
};

