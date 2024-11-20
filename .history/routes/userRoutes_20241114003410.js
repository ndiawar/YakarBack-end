import express from 'express';
import { createUser, getAllUsers, getUserById, updateUser, deleteUser } from '../controllers/userController.js';
import { registerUser, loginUser, authMiddleware, logoutUser } from '../controllers/authController.js'; // Ajoute l'extension .js

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
router.get('/profile', authMiddleware, (req, res) => {
  res.status(200).send({ message: 'Access granted to profile', user: req.user });
});

// Route pour la déconnexion
router.post('/logout', logoutUser);

// Exporter le routeur avec export default
export default router;
