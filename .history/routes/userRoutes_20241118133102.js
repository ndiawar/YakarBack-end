import express from 'express';
import { getAllUsers, getUserById, updateUser, deleteUser } from '../controllers/userController.js';
import { registerUser, loginUser, logoutUser } from '../controllers/authController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { roleMiddleware } from '../middleware/roleMiddleware.js';

const router = express.Router();

// Définir les routes
router.post('/users', createUser);
router.get('/users', getAllUsers);
router.get('/users/:id', getUserById);
router.put('/users/:id', updateUser);
router.delete('/users/:id', deleteUser);

// Route pour l'enregistrement d'un utilisateur
router.post('/register', registerUser);

// Route pour la connexion de l'utilisateur
router.post('/login', loginUser);

// Route protégée par middleware d'authentification
router.get('/admin', authMiddleware, roleMiddleware('admin'), (req, res) => {
  res.status(200).json({ message: 'Accès autorisé à la zone admin', user: req.user });
});

router.get('/user', authMiddleware, roleMiddleware('user', 'admin'), (req, res) => {
  res.status(200).json({ message: 'Accès autorisé à la zone utilisateur', user: req.user });
});


// Route pour la déconnexion
router.post('/logout', logoutUser);

// Exporter le routeur avec export default
export default router;
