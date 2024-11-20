import express from 'express';
import { 
  getAllUsers, 
  getUserById, 
  updateUser, 
  deleteUser, 
  updateUserRole 
} from '../controllers/userController.js';
import { 
  getAllDonnees, 
  getDonneesById, 
  createDonnees, 
  updateDonnees, 
  deleteDonnees 
} from '../controllers/dataController.js';
import { registerUser, loginUser, logoutUser } from '../controllers/authController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { roleMiddleware } from '../middleware/roleMiddleware.js';

const router = express.Router();

// *** Routes publiques ***

// Enregistrer un nouvel utilisateur
router.post('/register', registerUser);

// Connexion d'un utilisateur
router.post('/login', loginUser);

// Déconnexion d'un utilisateur
router.post('/logout', logoutUser);

// *** Routes protégées ***

// Récupérer tous les utilisateurs (admin uniquement)
router.get('/users', authMiddleware, roleMiddleware('admin'), getAllUsers);

// Récupérer un utilisateur par ID (admin et propriétaire du compte)
router.get('/users/:id', authMiddleware, roleMiddleware('admin', 'user'), getUserById);

// Modifier un utilisateur (admin ou propriétaire du compte) - Requêtes PUT pour mises à jour complètes
router.put('/users/:id', authMiddleware, roleMiddleware('admin', 'user'), updateUser);

// Modifier un utilisateur (admin ou propriétaire du compte) - Requêtes PATCH pour mises à jour partielles
router.patch('/users/:id', authMiddleware, roleMiddleware('admin', 'user'), updateUser);

// Désactiver un utilisateur (admin uniquement)
router.delete('/users/:id', authMiddleware, roleMiddleware('admin'), deleteUser);

// Modifier le rôle d'un utilisateur (admin uniquement)
router.patch('/users/:id/role', authMiddleware, roleMiddleware('admin'), updateUserRole);


// Récupérer toutes les données (accessible à l'admin et à l'utilisateur)
router.get('/', authMiddleware, roleMiddleware('admin', 'user'), getAllDonnees);

// Récupérer une donnée spécifique par ID (accessible à l'admin et à l'utilisateur)
router.get('/:id', authMiddleware, roleMiddleware('admin', 'user'), getDonneesById);

// Créer de nouvelles données (accessible uniquement à l'admin)
router.post('/', authMiddleware, roleMiddleware('admin'), createDonnees);

// Mettre à jour des données existantes (accessible uniquement à l'admin)
router.put('/:id', authMiddleware, roleMiddleware('admin'), updateDonnees);

// Supprimer des données (accessible uniquement à l'admin)
router.delete('/:id', authMiddleware, roleMiddleware('admin'), deleteDonnees);


// *** Routes spécifiques pour zones protégées ***

// Zone d'accès admin
router.get('/admin', authMiddleware, roleMiddleware('admin'), (req, res) => {
  res.status(200).json({ message: 'Accès autorisé à la zone admin', user: req.user });
});

// Zone d'accès utilisateur ou admin
router.get('/user', authMiddleware, roleMiddleware('user', 'admin'), (req, res) => {
  res.status(200).json({ message: 'Accès autorisé à la zone utilisateur', user: req.user });
});

export default router;
