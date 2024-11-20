import express from 'express';
import { 
    getAllDonnees, 
    getDonneesById, 
    createDonnees, 
    deleteDonnees, 
    getDailyAverage, 
    getWeeklyAverage, 
    getDataForWeek // Assurez-vous d'importer cette fonction
  } from '../controllers/dataController.js';  

import { authMiddleware } from '../middleware/authMiddleware.js';
import { roleMiddleware } from '../middleware/roleMiddleware.js';

const router = express.Router();

// *** Routes Données Capturées ***

/**
 * @swagger
 * tags:
 *   - name: "collecte"
 *     description: "Opérations liées à la collecte des données"
 */

/**
 * @swagger
 * /donnees:
 *   get:
 *     summary: Récupérer toutes les données
 *     description: Permet à un utilisateur ou un admin de récupérer toutes les données.
 *     tags:
 *       - "collecte"
 *     responses:
 *       200:
 *         description: Données récupérées avec succès.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 donnees:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                         example: "60f74f8f87b5c234b4e1bcdf"
 *                       date:
 *                         type: string
 *                         example: "2024-11-20"
 *                       heure:
 *                         type: string
 *                         example: "12:30"
 *                       temperature:
 *                         type: number
 *                         example: 25.6
 *                       humidite:
 *                         type: number
 *                         example: 65
 *                       ventiloActive:
 *                         type: boolean
 *                         example: true
 *                       buzzer:
 *                         type: boolean
 *                         example: false
 *                       signal:
 *                         type: number
 *                         example: 100
 *                       moyTemp:
 *                         type: number
 *                         example: 24.5
 *                       moyhum:
 *                         type: number
 *                         example: 60
 *       500:
 *         description: Erreur serveur.
 */
router.get('/donnees', authMiddleware, roleMiddleware('admin', 'user'), getAllDonnees);

/**
 * @swagger
 * /donnees/{id}:
 *   get:
 *     summary: Récupérer une donnée par ID
 *     description: Permet à un utilisateur ou un admin de récupérer une donnée spécifique par son ID.
 *     tags:
 *       - "collecte"
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
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 donnees:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                       example: "60f74f8f87b5c234b4e1bcdf"
 *                     date:
 *                       type: string
 *                       example: "2024-11-20"
 *                     heure:
 *                       type: string
 *                       example: "12:30"
 *                     temperature:
 *                       type: number
 *                       example: 25.6
 *                     humidite:
 *                       type: number
 *                       example: 65
 *                     ventiloActive:
 *                       type: boolean
 *                       example: true
 *                     buzzer:
 *                       type: boolean
 *                       example: false
 *                     signal:
 *                       type: number
 *                       example: 100
 *                     moyTemp:
 *                       type: number
 *                       example: 24.5
 *                     moyhum:
 *                       type: number
 *                       example: 60
 *       404:
 *         description: Donnée non trouvée.
 *       500:
 *         description: Erreur serveur.
 */
router.get('/donnees/:id', authMiddleware, roleMiddleware('admin', 'user'), getDonneesById);

/**
 * @swagger
 * /donnees:
 *   post:
 *     summary: Créer une nouvelle donnée
 *     description: Permet à un admin de créer une nouvelle donnée.
 *     tags:
 *       - "collecte"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               date:
 *                 type: string
 *                 description: La date de la donnée.
 *                 example: "2024-11-20"
 *               heure:
 *                 type: string
 *                 description: L'heure de la donnée.
 *                 example: "12:30"
 *               temperature:
 *                 type: number
 *                 description: La température enregistrée.
 *                 example: 25.6
 *               humidite:
 *                 type: number
 *                 description: L'humidité enregistrée.
 *                 example: 65
 *               ventiloActive:
 *                 type: boolean
 *                 description: Indique si le ventilo est actif.
 *                 example: true
 *               buzzer:
 *                 type: boolean
 *                 description: Indique si le buzzer est activé.
 *                 example: false
 *               signal:
 *                 type: number
 *                 description: La force du signal mesuré.
 *                 example: 100
 *               moyTemp:
 *                 type: number
 *                 description: La température moyenne calculée.
 *                 example: 24.5
 *               moyhum:
 *                 type: number
 *                 description: L'humidité moyenne calculée.
 *                 example: 60
 *     responses:
 *       201:
 *         description: Donnée créée avec succès.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Données créées avec succès"
 *                 donnees:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                       example: "60f74f8f87b5c234b4e1bcdf"
 *                     date:
 *                       type: string
 *                       example: "2024-11-20"
 *                     heure:
 *                       type: string
 *                       example: "12:30"
 *                     temperature:
 *                       type: number
 *                       example: 25.6
 *                     humidite:
 *                       type: number
 *                       example: 65
 *                     ventiloActive:
 *                       type: boolean
 *                       example: true
 *                     buzzer:
 *                       type: boolean
 *                       example: false
 *                     signal:
 *                       type: number
 *                       example: 100
 *                     moyTemp:
 *                       type: number
 *                       example: 24.5
 *                     moyhum:
 *                       type: number
 *                       example: 60
 *       400:
 *         description: Mauvaise demande.
 *       500:
 *         description: Erreur serveur.
 */
router.post('/donnees', authMiddleware, roleMiddleware('admin'), createDonnees);


/**
 * @swagger
 * /donnees/daily-average:
 *   get:
 *     summary: Retourner les moyennes journalières
 *     description: Retourne les moyennes journalières pour chaque jour.
 *     tags:
 *       - "collecte"
 *     responses:
 *       200:
 *         description: Liste des moyennes journalières récupérée avec succès.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   _id:
 *                     type: string
 *                   avgTemperature:
 *                     type: number
 *                   avgHumidite:
 *                     type: number
 */
router.get('/donnees/daily-average', authMiddleware, roleMiddleware('admin', 'user'), getDailyAverage);

/**
 * @swagger
 * /donnees/weekly-average:
 *   get:
 *     summary: Retourner les moyennes hebdomadaires
 *     description: Retourne les moyennes hebdomadaires pour chaque semaine.
 *     tags:
 *       - "collecte"
 *     responses:
 *       200:
 *         description: Liste des moyennes hebdomadaires récupérée avec succès.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   _id:
 *                     type: object
 *                     properties:
 *                       week:
 *                         type: integer
 *                       year:
 *                         type: integer
 *                   avgTemperature:
 *                     type: number
 *                   avgHumidite:
 *                     type: number
 */
router.get('/donnees/weekly-average', authMiddleware, roleMiddleware('admin', 'user'), getWeeklyAverage);
/**
 * @swagger
 * /donnees/week/{date}:
 *   get:
 *     summary: Filtrer les données par semaine
 *     description: Filtre les données pour la semaine contenant la date spécifiée
 *     tags:
 *       - "collecte"
 *     parameters:
 *       - in: path
 *         name: date
 *         required: true
 *         description: Date au format YYYY-MM-DD pour filtrer la semaine.
 *         schema:
 *           type: string
 *           example: "2024-11-20"
 *     responses:
 *       200:
 *         description: Données de la semaine récupérées avec succès.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 weekData:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       date:
 *                         type: string
 *                       temperature:
 *                         type: number
 *                       humidite:
 *                         type: number
 */
router.get('/donnees/week/:date', authMiddleware, roleMiddleware('admin', 'user'), getDataForWeek);

export default router;
