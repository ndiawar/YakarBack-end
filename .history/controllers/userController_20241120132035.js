import bcrypt from 'bcryptjs';
import User from '../models/user.js';


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
  const { name, email, password, telephone, adresse, photo, status, roles, secretCode } = req.body;

  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'Utilisateur non trouvé' });
    }

    // Vérifier l'unicité de l'email s'il est modifié
    if (email && email !== user.email) {
      const emailExists = await User.findOne({ email });
      if (emailExists) {
        return res.status(400).json({ message: 'Cet email est déjà utilisé par un autre utilisateur.' });
      }
      user.email = email;
    }

    // Vérifier l'unicité du téléphone s'il est modifié
    if (telephone && telephone !== user.telephone) {
      const phoneExists = await User.findOne({ telephone });
      if (phoneExists) {
        return res.status(400).json({ message: 'Ce numéro de téléphone est déjà utilisé par un autre utilisateur.' });
      }
      user.telephone = telephone;
    }

    // Vérifier l'unicité du code secret s'il est modifié
    if (secretCode && secretCode !== user.authentication.secretCode) {
      const codeExists = await User.findOne({ 'authentication.secretCode': secretCode });
      if (codeExists) {
        return res.status(400).json({ message: 'Ce code secret est déjà utilisé par un autre utilisateur.' });
      }
      user.authentication.secretCode = secretCode;
    }

    // Mettre à jour les autres champs si fournis
    user.name = name || user.name;
    user.adresse = adresse || user.adresse;
    user.photo = photo || user.photo;
    user.status = status !== undefined ? status : user.status; // Gestion booléenne
    user.roles = roles || user.roles;

    if (password) {
      // Si un mot de passe est fourni, il faut le hacher avant de le sauvegarder
      const hashedPassword = await bcrypt.hash(password, 12);
      user.authentication.password = hashedPassword;
    }

    // Mettre à jour la date de modification
    user.date_modification = new Date();

    // Sauvegarder les changements
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

/**
 * @swagger
 * /users/{id}/role:
 *   patch:
 *     summary: Modifier le rôle d'un utilisateur
 *     description: "Permet à un admin de changer le rôle d'un utilisateur (ex. : de 'user' à 'admin')."
 *     tags:
 *       - "user"
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: "ID de l'utilisateur à qui le rôle sera attribué."
 *         schema:
 *           type: string
 *           example: "60f74f8f87b5c234b4e1bcdf"
 *     responses:
 *       200:
 *         description: "Rôle de l'utilisateur modifié avec succès."
 *       400:
 *         description: "Mauvaise demande."
 *       404:
 *         description: "Utilisateur non trouvé."
 */
router.patch('/users/:id/role', authMiddleware, roleMiddleware('admin'), toggleUserRole);



