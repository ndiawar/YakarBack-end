import express from 'express';
import { registerUser, loginUser, logoutUser } from '../controllers/authController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { roleMiddleware } from '../middleware/roleMiddleware.js';

const router = express.Router();

// *** Routes Authentification ***

/**
 * @swagger
 * tags:
 *   - name: "authentification"
 *     description: "Opérations liées à l'authentification des utilisateurs"
 */

/**
 * @swagger
 * /login:
 *   post:
 *     summary: Connexion d'un utilisateur
 *     description: Permet à un utilisateur de se connecter avec un nom d'utilisateur et un mot de passe.
 *     tags:
 *       - "authentification"
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
 *     tags:
 *       - "authentification"
 *     responses:
 *       200:
 *         description: Déconnexion réussie.
 */
router.post('/logout', authMiddleware, roleMiddleware('admin', 'user'), logoutUser);

export default router;
