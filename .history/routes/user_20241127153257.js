import express from 'express';
import { 
  getAllUsers, 
  getUserById, 
  updateUser, 
  deleteUser, 
  toggleUserRole 
} from '../controllers/userController.js';
import { registerUser } from '../controllers/authController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { roleMiddleware } from '../middleware/roleMiddleware.js';

const router = express.Router();

// *** Routes Utilisateurs ***

/**
 * @swagger
 * tags:
 *   - name: "user"
 *     description: "Opérations sur les utilisateurs"
 */
/**
 * @swagger
 * /register:
 *   post:
 *     summary: Enregistrer un nouvel utilisateur
 *     description: Permet de créer un nouvel utilisateur avec des informations spécifiques.
 *     tags:
 *       - "user"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: Nom de l'utilisateur
 *                 example: "John Doe"
 *               email:
 *                 type: string
 *                 description: Adresse email de l'utilisateur
 *                 example: "johndoe@example.com"
 *               password:
 *                 type: string
 *                 description: Mot de passe de l'utilisateur
 *                 example: "Password123"
 *               telephone:
 *                 type: string
 *                 description: Numéro de téléphone de l'utilisateur
 *                 example: "+1234567890"
 *               adresse:
 *                 type: string
 *                 description: Adresse de l'utilisateur
 *                 example: "123 rue Exemple, Paris"
 *               photo:
 *                 type: string
 *                 description: URL de la photo de profil de l'utilisateur (optionnel)
 *                 example: "http://example.com/photo.jpg"
 *     responses:
 *       201:
 *         description: Utilisateur créé avec succès.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Utilisateur créé avec succès."
 *                 user:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       example: "60f74f8f87b5c234b4e1bcdf"
 *                     name:
 *                       type: string
 *                       example: "John Doe"
 *                     email:
 *                       type: string
 *                       example: "johndoe@example.com"
 *                     telephone:
 *                       type: string
 *                       example: "+1234567890"
 *                     adresse:
 *                       type: string
 *                       example: "123 rue Exemple, Paris"
 *                     photo:
 *                       type: string
 *                       example: "http://example.com/photo.jpg"
 *                     role:
 *                       type: array
 *                       items:
 *                         type: string
 *                       example: ["user"]
 *                     status:
 *                       type: string
 *                       example: "active"
 *                     secretCode:
 *                       type: integer
 *                       example: 1234
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *                       example: "2024-11-20T12:34:56Z"
 *       400:
 *         description: Mauvaise demande. Les champs obligatoires ne sont pas renseignés ou l'utilisateur existe déjà.
 *       500:
 *         description: Une erreur est survenue. Veuillez réessayer plus tard.
 */
router.post('/register', registerUser);

/**
 * @swagger
 * /users:
 *   get:
 *     summary: Récupérer tous les utilisateurs
 *     description: Permet à un admin de récupérer la liste de tous les utilisateurs.
 *     tags:
 *       - "user"
 *     responses:
 *       200:
 *         description: Liste des utilisateurs récupérée avec succès.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 users:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                         description: L'ID unique de l'utilisateur.
 *                         example: "60f74f8f87b5c234b4e1bcdf"
 *                       name:
 *                         type: string
 *                         description: Le nom de l'utilisateur.
 *                         example: "John Doe"
 *                       email:
 *                         type: string
 *                         description: L'email de l'utilisateur.
 *                         example: "johndoe@example.com"
 *                       telephone:
 *                         type: string
 *                         description: Le téléphone de l'utilisateur.
 *                         example: "+1234567890"
 *                       adresse:
 *                         type: string
 *                         description: L'adresse de l'utilisateur.
 *                         example: "123 rue Exemple, Paris"
 *                       photo:
 *                         type: string
 *                         description: L'URL de la photo de l'utilisateur (optionnelle).
 *                         example: "http://example.com/photo.jpg"
 *                       role:
 *                         type: array
 *                         items:
 *                           type: string
 *                         description: Les rôles de l'utilisateur.
 *                         example: ["user", "admin"]
 *                       status:
 *                         type: string
 *                         description: Le statut de l'utilisateur.
 *                         example: "active"
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 *                         description: La date de création du compte utilisateur.
 *                         example: "2024-11-20T12:34:56Z"
 *       403:
 *         description: Accès interdit.
 *       500:
 *         description: Erreur serveur.
 */
router.get('/users', getAllUsers);

/**
 * @swagger
 * /users/{id}:
 *   get:
 *     summary: Récupérer un utilisateur par ID
 *     description: Permet à un admin ou au propriétaire d'un compte d'accéder à un utilisateur par son ID.
 *     tags:
 *       - "user"
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID de l'utilisateur à récupérer.
 *         schema:
 *           type: string
 *           example: "60f74f8f87b5c234b4e1bcdf"
 *     responses:
 *       200:
 *         description: Utilisateur récupéré avec succès.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 user:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       description: L'ID unique de l'utilisateur.
 *                       example: "60f74f8f87b5c234b4e1bcdf"
 *                     name:
 *                       type: string
 *                       description: Le nom de l'utilisateur.
 *                       example: "John Doe"
 *                     email:
 *                       type: string
 *                       description: L'email de l'utilisateur.
 *                       example: "johndoe@example.com"
 *                     telephone:
 *                       type: string
 *                       description: Le téléphone de l'utilisateur.
 *                       example: "+1234567890"
 *                     adresse:
 *                       type: string
 *                       description: L'adresse de l'utilisateur.
 *                       example: "123 rue Exemple, Paris"
 *                     photo:
 *                       type: string
 *                       description: L'URL de la photo de l'utilisateur (optionnelle).
 *                       example: "http://example.com/photo.jpg"
 *                     role:
 *                       type: array
 *                       items:
 *                         type: string
 *                       description: Les rôles de l'utilisateur.
 *                       example: ["user", "admin"]
 *                     status:
 *                       type: string
 *                       description: Le statut de l'utilisateur.
 *                       example: "active"
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *                       description: La date de création du compte utilisateur.
 *                       example: "2024-11-20T12:34:56Z"
 *       404:
 *         description: Utilisateur non trouvé.
 *       500:
 *         description: Erreur serveur.
 */
router.get('/users/:id', getUserById);

/**
 * @swagger
 * /users/{id}:
 *   put:
 *     summary: Modifier un utilisateur
 *     description: Permet de modifier un utilisateur de manière complète (admin ou propriétaire du compte).
 *     tags:
 *       - "user"
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID de l'utilisateur à modifier.
 *         schema:
 *           type: string
 *           example: "60f74f8f87b5c234b4e1bcdf"
 *       - in: body
 *         name: user
 *         description: Les nouvelles informations de l'utilisateur à mettre à jour.
 *         required: true
 *         schema:
 *           type: object
 *           properties:
 *             name:
 *               type: string
 *               description: Nouveau nom de l'utilisateur.
 *               example: "John Doe"
 *             email:
 *               type: string
 *               description: Nouvel email de l'utilisateur (unique).
 *               example: "newemail@example.com"
 *             password:
 *               type: string
 *               description: Nouveau mot de passe de l'utilisateur (optionnel).
 *               example: "newpassword123"
 *             telephone:
 *               type: string
 *               description: Nouveau numéro de téléphone de l'utilisateur (unique).
 *               example: "+1234567890"
 *             adresse:
 *               type: string
 *               description: Nouvelle adresse de l'utilisateur.
 *               example: "456 rue Exemple, Paris"
 *             photo:
 *               type: string
 *               description: Nouvelle URL de la photo de l'utilisateur.
 *               example: "http://example.com/photo.jpg"
 *             status:
 *               type: string
 *               description: Nouveau statut de l'utilisateur ("active", "inactive").
 *               example: "active"
 *             roles:
 *               type: array
 *               items:
 *                 type: string
 *               description: Liste des rôles de l'utilisateur.
 *               example: ["user", "admin"]
 *             secretCode:
 *               type: string
 *               description: Nouveau code secret de l'utilisateur (unique).
 *               example: "1234"
 *     responses:
 *       200:
 *         description: Utilisateur modifié avec succès.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Utilisateur mis à jour avec succès"
 *                 user:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       description: ID de l'utilisateur.
 *                       example: "60f74f8f87b5c234b4e1bcdf"
 *                     name:
 *                       type: string
 *                       description: Nom de l'utilisateur.
 *                       example: "John Doe"
 *                     email:
 *                       type: string
 *                       description: Email de l'utilisateur.
 *                       example: "newemail@example.com"
 *                     telephone:
 *                       type: string
 *                       description: Téléphone de l'utilisateur.
 *                       example: "+1234567890"
 *                     adresse:
 *                       type: string
 *                       description: Adresse de l'utilisateur.
 *                       example: "456 rue Exemple, Paris"
 *                     photo:
 *                       type: string
 *                       description: URL de la photo de l'utilisateur.
 *                       example: "http://example.com/photo.jpg"
 *                     status:
 *                       type: string
 *                       description: Statut de l'utilisateur.
 *                       example: "active"
 *                     roles:
 *                       type: array
 *                       items:
 *                         type: string
 *                       description: Rôles de l'utilisateur.
 *                       example: ["user", "admin"]
 *                     secretCode:
 *                       type: string
 *                       description: Code secret de l'utilisateur.
 *                       example: "1234"
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *                       description: Date de création du compte.
 *                       example: "2024-11-20T12:34:56Z"
 *       400:
 *         description: Mauvaise demande (par exemple, email ou téléphone déjà utilisés).
 *       404:
 *         description: Utilisateur non trouvé.
 *       500:
 *         description: Erreur serveur.
 */
router.put('/users/:id', updateUser);
/**
 * @swagger
 * /users/{id}:
 *   patch:
 *     summary: Modifier partiellement un utilisateur
 *     description: Permet de modifier un utilisateur de manière partielle (admin ou propriétaire du compte).
 *     tags:
 *       - "user"
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID de l'utilisateur à modifier.
 *         schema:
 *           type: string
 *           example: "60f74f8f87b5c234b4e1bcdf"
 *       - in: body
 *         name: user
 *         description: Les informations partiellement mises à jour de l'utilisateur.
 *         required: true
 *         schema:
 *           type: object
 *           properties:
 *             name:
 *               type: string
 *               description: Nouveau nom de l'utilisateur (optionnel).
 *               example: "John Doe"
 *             email:
 *               type: string
 *               description: Nouvel email de l'utilisateur (optionnel).
 *               example: "newemail@example.com"
 *     responses:
 *       200:
 *         description: Utilisateur mis à jour avec succès.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Utilisateur mis à jour avec succès"
 *                 user:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       description: ID de l'utilisateur.
 *                       example: "60f74f8f87b5c234b4e1bcdf"
 *                     name:
 *                       type: string
 *                       description: Nom de l'utilisateur.
 *                       example: "John Doe"
 *                     email:
 *                       type: string
 *                       description: Email de l'utilisateur.
 *                       example: "newemail@example.com"
 *                     telephone:
 *                       type: string
 *                       description: Téléphone de l'utilisateur.
 *                       example: "+1234567890"
 *                     adresse:
 *                       type: string
 *                       description: Adresse de l'utilisateur.
 *                       example: "456 rue Exemple, Paris"
 *                     photo:
 *                       type: string
 *                       description: URL de la photo de l'utilisateur.
 *                       example: "http://example.com/photo.jpg"
 *                     status:
 *                       type: string
 *                       description: Statut de l'utilisateur.
 *                       example: "active"
 *                     roles:
 *                       type: array
 *                       items:
 *                         type: string
 *                       description: Rôles de l'utilisateur.
 *                       example: ["user", "admin"]
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *                       description: Date de création du compte.
 *                       example: "2024-11-20T12:34:56Z"
 *       400:
 *         description: Mauvaise demande (par exemple, email ou téléphone déjà utilisés).
 *       404:
 *         description: Utilisateur non trouvé.
 *       500:
 *         description: Erreur serveur.
 */
router.patch('/users/:id', updateUser);

/**
 * @swagger
 * /users/{id}:
 *   delete:
 *     summary: Supprimer un utilisateur
 *     description: Permet à un admin de supprimer un utilisateur par son ID.
 *     tags:
 *       - "user"
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID de l'utilisateur à supprimer.
 *         schema:
 *           type: string
 *           example: "60f74f8f87b5c234b4e1bcdf"
 *     responses:
 *       200:
 *         description: Utilisateur supprimé avec succès.
 *       404:
 *         description: Utilisateur non trouvé.
 *       500:
 *         description: Erreur serveur.
 */
router.delete('/users/:id', deleteUser);

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
router.patch('/users/:id/role', toggleUserRole);


export default router;
