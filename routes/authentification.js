import express from 'express';
import { registerUser, loginWithEmail,loginWithSecretCode, logoutUser, checkEmailExistence } from '../controllers/authController.js';
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
 *     description: Permet à un utilisateur de se connecter avec un nom d'utilisateur et un mot de passe ou un code secret.
 *     tags:
 *       - "authentification"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 description: L'email de l'utilisateur pour se connecter (obligatoire si le mot de passe est utilisé)
 *                 example: "johndoe@example.com"
 *               password:
 *                 type: string
 *                 description: Le mot de passe de l'utilisateur (obligatoire si l'email est fourni)
 *                 example: "Password123"
 *               secretCode:
 *                 type: string
 *                 description: Le code secret pour se connecter (utilisé à la place de l'email et du mot de passe)
 *                 example: "1234"
 *     responses:
 *       200:
 *         description: Connexion réussie. Retourne le token d'authentification et les informations de l'utilisateur.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Connexion réussie."
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
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *                       example: "2024-11-20T12:34:56Z"
 *       400:
 *         description: Mauvaise demande, email/mot de passe ou code secret manquants ou invalides.
 *       401:
 *         description: Identifiants invalides.
 *       404:
 *         description: Utilisateur non trouvé.
 *       500:
 *         description: Une erreur serveur s'est produite.
 */
router.post('/login-email', loginWithEmail);

router.post('/login-secret', loginWithSecretCode);
// Route pour vérifier l'existence de l'email
router.post('/check-email', checkEmailExistence);

/**
 * @swagger
 * /logout:
 *   post:
 *     summary: Déconnexion d'un utilisateur
 *     description: Permet à un utilisateur de se déconnecter de son compte en effaçant le cookie d'authentification.
 *     tags:
 *       - "authentification"
 *     responses:
 *       200:
 *         description: Déconnexion réussie.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Déconnexion réussie."
 *       401:
 *         description: Utilisateur non authentifié.
 *       500:
 *         description: Une erreur serveur s'est produite.
 */
router.post('/logout', authMiddleware, roleMiddleware('admin', 'user'), logoutUser);

export default router;
