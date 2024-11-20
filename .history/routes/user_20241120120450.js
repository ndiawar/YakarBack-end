import express from 'express';
import { 
  getAllUsers, 
  getUserById, 
  updateUser, 
  deleteUser, 
  toggleUserRole 
} from '../controllers/userController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { roleMiddleware } from '../middleware/roleMiddleware.js';

const router = express.Router();

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
 *     description: "Permet à un admin de changer le rôle d'un utilisateur (ex. : de 'user' à 'admin')."
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: "ID de l'utilisateur à qui le rôle sera attribué."
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: "Rôle de l'utilisateur modifié avec succès."
 *       400:
 *         description: "Mauvaise demande."
 *       404:
 *         description: "Utilisateur non trouvé."
 */
router.patch('/users/:id/role', authMiddleware, roleMiddleware('admin'), toggleUserRole);

export default router;
