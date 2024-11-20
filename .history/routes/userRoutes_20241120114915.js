import express from 'express';
import { 
  getAllUsers, 
  getUserById, 
  updateUser, 
  deleteUser, 
  toggleUserRole 
} from '../controllers/userController.js';
import { 
  getAllDonnees, 
  getDonneesById, 
  createDonnees, 
  deleteDonnees 
} from '../controllers/dataController.js';
import { registerUser, loginUser, logoutUser } from '../controllers/authController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { roleMiddleware } from '../middleware/roleMiddleware.js';

const router = express.Router();

// *** Routes Authentification ***

/**
 * @swagger
 * /register:
 *   post:
 *     summary: Enregistrer un nouvel utilisateur
 *     description: Permet de créer un nouvel utilisateur avec des informations spécifiques.
 *     responses:
 *       201:
 *         description: Utilisateur créé avec succès.
 *       400:
 *         description: Mauvaise demande.
 */
router.post('/register', authMiddleware, roleMiddleware('admin'), registerUser);

/**
 * @swagger
 * /login:
 *   post:
 *     summary: Connexion d'un utilisateur
 *     description: Permet à un utilisateur de se connecter avec un nom d'utilisateur et un mot de passe.
 *     responses:
 *       200:
 *         description: Connexion réussie.
 *       401:
 *         description: Identifiants invalides.
 */
router.post('/login', loginUser);

/**
 * @swagger
 * /logout:
 *   post:
 *     summary: Déconnexion d'un utilisateur
 *     description: Permet à un utilisateur de se déconnecter de son compte.
 *     responses:
 *       200:
 *         description: Déconnexion réussie.
 */
router.post('/logout', authMiddleware, roleMiddleware('admin', 'user'), logoutUser);

// *** Routes Utilisateurs ***

/**
 * @swagger
 * /users:
 *   get:
 *     summary: Récupérer tous les utilisateurs
 *     description: Permet à un admin de récupérer la liste de tous les utilisateurs.
 *     responses:
 *       200:
 *         description: Liste des utilisateurs récupérée avec succès.
 *       403:
 *         description: Accès interdit.
 */
router.get('/users', authMiddleware, roleMiddleware('admin'), getAllUsers);

/**
 * @swagger
 * /users/{id}:
 *   get:
 *     summary: Récupérer un utilisateur par ID
 *     description: Permet à un admin ou au propriétaire d'un compte d'accéder à un utilisateur par son ID.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID de l'utilisateur à récupérer.
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Utilisateur récupéré avec succès.
 *       404:
 *         description: Utilisateur non trouvé.
 */
router.get('/users/:id', authMiddleware, roleMiddleware('admin', 'user'), getUserById);

/**
 * @swagger
 * /users/{id}:
 *   put:
 *     summary: Modifier un utilisateur
 *     description: Permet de modifier un utilisateur de manière complète (admin ou propriétaire du compte).
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID de l'utilisateur à modifier.
 *         schema:
 *           type: string
 *       - in: body
 *         name: user
 *         description: Les nouvelles informations de l'utilisateur à mettre à jour.
 *         required: true
 *         schema:
 *           type: object
 *           properties:
 *             name:
 *               type: string
 *             email:
 *               type: string
 *             password:
 *               type: string
 *     responses:
 *       200:
 *         description: Utilisateur modifié avec succès.
 *       400:
 *         description: Mauvaise demande.
 *       404:
 *         description: Utilisateur non trouvé.
 */
router.put('/users/:id', authMiddleware, roleMiddleware('admin', 'user'), updateUser);

/**
 * @swagger
 * /users/{id}:
 *   patch:
 *     summary: Modifier partiellement un utilisateur
 *     description: Permet de modifier un utilisateur de manière partielle (admin ou propriétaire du compte).
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID de l'utilisateur à modifier.
 *         schema:
 *           type: string
 *       - in: body
 *         name: user
 *         description: Les informations partiellement mises à jour de l'utilisateur.
 *         required: true
 *         schema:
 *           type: object
 *           properties:
 *             name:
 *               type: string
 *             email:
 *               type: string
 *     responses:
 *       200:
 *         description: Utilisateur mis à jour avec succès.
 *       400:
 *         description: Mauvaise demande.
 *       404:
 *         description: Utilisateur non trouvé.
 */
router.patch('/users/:id', authMiddleware, roleMiddleware('admin', 'user'), updateUser);

/**
 * @swagger
 * /users/{id}:
 *   delete:
 *     summary: Supprimer un utilisateur
 *     description: Permet à un admin de supprimer un utilisateur par son ID.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID de l'utilisateur à supprimer.
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Utilisateur supprimé avec succès.
 *       404:
 *         description: Utilisateur non trouvé.
 */
router.delete('/users/:id', authMiddleware, roleMiddleware('admin'), deleteUser);

/**
 * @swagger
 * /users/{id}/role:
 *   patch:
 *     summary: Modifier le rôle d'un utilisateur
 *     description: |
 *       Permet à un admin de changer le rôle d'un utilisateur 
 *       (ex. : de "user" à "admin").
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID de l'utilisateur à qui le rôle sera attribué.
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Rôle de l'utilisateur modifié avec succès.
 *       400:
 *         description: Mauvaise demande.
 *       404:
 *         description: Utilisateur non trouvé.
 */
router.patch('/users/:id/role', authMiddleware, roleMiddleware('admin'), toggleUserRole);

// *** Routes Données Capturées ***

/**
 * @swagger
 * /donnees:
 *   get:
 *     summary: Récupérer toutes les données
 *     description: Permet à un utilisateur ou un admin de récupérer toutes les données.
 *     responses:
 *       200:
 *         description: Données récupérées avec succès.
 */
router.get('/donnees', authMiddleware, roleMiddleware('admin', 'user'), getAllDonnees);

/**
 * @swagger
 * /donnees/{id}:
 *   get:
 *     summary: Récupérer une donnée par ID
 *     description: Permet à un utilisateur ou un admin de récupérer une donnée spécifique par son ID.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID de la donnée à récupérer.
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Donnée récupérée avec succès.
 *       404:
 *         description: Donnée non trouvée.
 */
router.get('/donnees/:id', authMiddleware, roleMiddleware('admin', 'user'), getDonneesById);

/**
 * @swagger
 * /donnees:
 *   post:
 *     summary: Créer une nouvelle donnée
 *     description: Permet à un admin de créer une nouvelle donnée.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               data:
 *                 type: string
 *     responses:
 *       201:
 *         description: Donnée créée avec succès.
 *       400:
 *         description: Mauvaise demande.
 */
router.post('/donnees', authMiddleware, roleMiddleware('admin'), createDonnees);

/**
 * @swagger
 * /donnees/{id}:
 *   delete:
 *     summary: Supprimer une donnée
 *     description: Permet à un admin de supprimer une donnée par son ID.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID de la donnée à supprimer.
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Donnée supprimée avec succès.
 *       404:
 *         description: Donnée non trouvée.
 */
router.delete('/donnees/:id', authMiddleware, roleMiddleware('admin'), deleteDonnees);

// *** Routes spécifiques pour zones protégées ***

/**
 * @swagger
 * /admin:
 *   get:
 *     summary: Zone d'accès admin
 *     description: Permet uniquement à un admin d'accéder à cette zone.
 *     responses:
 *       200:
 *         description: Accès autorisé à la zone admin.
 *       403:
 *         description: Accès interdit.
 */
router.get('/admin', authMiddleware, roleMiddleware('admin'), (req, res) => {
  res.status(200).json({ message: 'Accès autorisé à la zone admin', user: req.user });
});

/**
 * @swagger
 * /user:
 *   get:
 *     summary: Zone d'accès utilisateur ou admin
 *     description: Permet à un utilisateur ou un admin d'accéder à cette zone.
 *     responses:
 *       200:
 *         description: Accès autorisé à la zone utilisateur.
 *       403:
 *         description: Accès interdit.
 */
router.get('/user', authMiddleware, roleMiddleware('user', 'admin'), (req, res) => {
  res.status(200).json({ message: 'Accès autorisé à la zone utilisateur', user: req.user });
});

export default router;
