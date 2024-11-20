import User from '../models/user.js';

// Créer un utilisateur
export const createUser = async (req, res) => {
  const { name, email, password, secretCode } = req.body;

  try {
    // Vérifier si l'utilisateur existe déjà
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'L\'email est déjà utilisé' });
    }

    // Créer un nouvel utilisateur
    const newUser = new User({
      name,
      email,
      authentication: {
        password,
        secretCode,
        access_token: '', // Ce champ sera probablement généré plus tard lors de la connexion
      },
    });

    // Sauvegarder l'utilisateur
    await newUser.save();
    res.status(201).json({ message: 'Utilisateur créé avec succès', user: newUser });
  } catch (err) {
    res.status(500).json({ message: 'Erreur lors de la création de l\'utilisateur', error: err });
  }
};

// Récupérer tous les utilisateurs
export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find();
    res.status(200).json({ users });
  } catch (err) {
    res.status(500).json({ message: 'Erreur lors de la récupération des utilisateurs', error: err });
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
    res.status(500).json({ message: 'Erreur lors de la récupération de l\'utilisateur', error: err });
  }
};

// Mettre à jour un utilisateur
export const updateUser = async (req, res) => {
  const userId = req.params.id;
  const { name, email, password, secretCode } = req.body;

  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'Utilisateur non trouvé' });
    }

    // Mettre à jour les champs de l'utilisateur
    user.name = name || user.name;
    user.email = email || user.email;

    if (password) {
      // Si un mot de passe est fourni, il faut le hacher avant de le sauvegarder
      user.authentication.password = password;
    }

    user.authentication.secretCode = secretCode || user.authentication.secretCode;

    // Sauvegarder les changements
    await user.save();
    res.status(200).json({ message: 'Utilisateur mis à jour avec succès', user });
  } catch (err) {
    res.status(500).json({ message: 'Erreur lors de la mise à jour de l\'utilisateur', error: err });
  }
};

// Supprimer un utilisateur
export const deleteUser = async (req, res) => {
  const userId = req.params.id;

  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'Utilisateur non trouvé' });
    }

    // Supprimer l'utilisateur
    await user.remove();
    res.status(200).json({ message: 'Utilisateur supprimé avec succès' });
  } catch (err) {
    res.status(500).json({ message: 'Erreur lors de la suppression de l\'utilisateur', error: err });
  }
};
