import express from 'express';
import {
  getAllHistorique,
  getHistoriqueByDateRange,
  getHistoriqueByAction,
  getHistoriqueByUser,
} from '../controllers/historiqueController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { roleMiddleware } from '../middleware/roleMiddleware.js';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   - name: "historique"
 *     description: "Opérations sur l'historique des actions"
 */

/**
 * @swagger
 * /historique:
 *   get:
 *     summary: Récupérer tous les historiques
 *     description: Permet de récupérer toutes les actions enregistrées dans l'historique.
 *     tags:
 *       - "historique"
 *     responses:
 *       200:
 *         description: Liste des historiques
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   date:
 *                     type: string
 *                     format: date-time
 *                     example: "2024-11-20T12:34:56Z"
 *                   heure:
 *                     type: string
 *                     example: "12:34"
 *                   action:
 *                     type: string
 *                     example: "Mise à jour de l'utilisateur"
 *                   id_users:
 *                     type: string
 *                     example: "60f74f8f87b5c234b4e1bcdf"
 *       500:
 *         description: Une erreur est survenue.
 */
router.get('/historique', getAllHistorique);

/**
 * @swagger
 * /historique/date-range:
 *   get:
 *     summary: Récupérer l'historique entre deux dates
 *     description: Permet de récupérer les historiques entre deux dates spécifiques.
 *     tags:
 *       - "historique"
 *     parameters:
 *       - in: query
 *         name: startDate
 *         required: true
 *         schema:
 *           type: string
 *           format: date-time
 *           example: "2024-11-01T00:00:00Z"
 *       - in: query
 *         name: endDate
 *         required: true
 *         schema:
 *           type: string
 *           format: date-time
 *           example: "2024-11-20T23:59:59Z"
 *     responses:
 *       200:
 *         description: Liste des historiques dans la période donnée
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   date:
 *                     type: string
 *                     format: date-time
 *                     example: "2024-11-20T12:34:56Z"
 *                   heure:
 *                     type: string
 *                     example: "12:34"
 *                   action:
 *                     type: string
 *                     example: "Mise à jour de l'utilisateur"
 *                   id_users:
 *                     type: string
 *                     example: "60f74f8f87b5c234b4e1bcdf"
 *       400:
 *         description: Les dates sont requises
 *       500:
 *         description: Une erreur est survenue.
 */
router.get('/historique/date-range', getHistoriqueByDateRange);

/**
 * @swagger
 * /historique/action:
 *   get:
 *     summary: Récupérer l'historique d'une action spécifique
 *     description: Permet de récupérer les historiques correspondant à une action spécifique.
 *     tags:
 *       - "historique"
 *     parameters:
 *       - in: query
 *         name: action
 *         required: true
 *         schema:
 *           type: string
 *           example: "Inscription d'un nouvel utilisateur"
 *     responses:
 *       200:
 *         description: Liste des historiques correspondant à l'action donnée
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   date:
 *                     type: string
 *                     format: date-time
 *                     example: "2024-11-20T12:34:56Z"
 *                   heure:
 *                     type: string
 *                     example: "12:34"
 *                   action:
 *                     type: string
 *                     example: "Inscription d'un nouvel utilisateur"
 *                   id_users:
 *                     type: string
 *                     example: "60f74f8f87b5c234b4e1bcdf"
 *       400:
 *         description: L'action est requise
 *       500:
 *         description: Une erreur est survenue.
 */
router.get('/historique/action', authMiddleware, roleMiddleware('admin'), getHistoriqueByAction);

/**
 * @swagger
 * /historique/user/{userId}:
 *   get:
 *     summary: Récupérer l'historique d'un utilisateur spécifique
 *     description: Permet de récupérer l'historique des actions d'un utilisateur spécifique.
 *     tags:
 *       - "historique"
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *           example: "60f74f8f87b5c234b4e1bcdf"
 *     responses:
 *       200:
 *         description: Liste des historiques de l'utilisateur
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   date:
 *                     type: string
 *                     format: date-time
 *                     example: "2024-11-20T12:34:56Z"
 *                   heure:
 *                     type: string
 *                     example: "12:34"
 *                   action:
 *                     type: string
 *                     example: "Mise à jour de l'utilisateur"
 *                   id_users:
 *                     type: string
 *                     example: "60f74f8f87b5c234b4e1bcdf"
 *       404:
 *         description: Aucun historique trouvé pour cet utilisateur
 *       500:
 *         description: Une erreur est survenue.
 */
router.get('/historique/user/:userId', authMiddleware, roleMiddleware('admin'), getHistoriqueByUser);

export default router;
