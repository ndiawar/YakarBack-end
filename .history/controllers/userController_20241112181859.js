const User = require('../models/user');

// Créer un utilisateur avec un mot de passe et un code secret
exports.createUser = async (req, res) => {
  const { name, email, password, secretCode } = req.body;

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'L\'email est déjà utilisé' });
    }

    const newUser = new User({
      name,
      email,
      password,  // Le mot de passe sera haché automatiquement lors de la sauvegarde
      secretCode,
    });

    await newUser.save();
    res.status(201).json({ message: 'Utilisateur créé avec succès', user: newUser });
  } catch (err) {
    res.status(500).json({ message: 'Erreur lors de la création de l\'utilisateur', error: err });
  }
};

// Connexion de l'utilisateur avec mot de passe et code secret
exports.loginUser = async (req, res) => {
  const { email, password, secretCode } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'Utilisateur non trouvé' });
    }

    // Comparer le mot de passe
    const isPasswordMatch = await user.matchPassword(password);
    if (!isPasswordMatch) {
      return res.status(400).json({ message: 'Mot de passe incorrect' });
    }

    // Comparer le code secret
    if (user.secretCode !== secretCode) {
      return res.status(400).json({ message: 'Code secret incorrect' });
    }

    res.status(200).json({ message: 'Connexion réussie', user });
  } catch (err) {
    res.status(500).json({ message: 'Erreur de connexion', error: err });
  }
};
