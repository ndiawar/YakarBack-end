import express from 'express';
import { 
    getAllDonnees, 
    getDonneesById, 
    getDailyAverage, 
    getWeeklyAverage, 
    getMonthlyAverage,
    getCurrentMonthData,
    getWeeklyData,
    getMoyenneHebdomadaire, 
    getMoyenneJournaliere, 
    getDataForWeek // Assurez-vous d'importer cette fonction
  } from '../controllers/dataController.js';  

import { authMiddleware } from '../middleware/authMiddleware.js';
import { roleMiddleware } from '../middleware/roleMiddleware.js';
import { captureData } from '../controllers/dataController.js';
const router = express.Router();

// *** Routes Données Capturées ***

/**
 * @swagger
 * tags:
 *   - name: "collecte"
 *     description: "Opérations liées à la collecte des données"
 */

// *** Route pour la capture des données en temps réel via WebSocket ***
router.get('/donnees/week/:weekType', getWeeklyData);

/**
 * @swagger
 * tags:
 *   - name: "collecte"
 *     description: "Opérations liées à la collecte des données"
 */

/**
 * @swagger
 * /donnees/capture:
 *   post:
 *     summary: Démarrer la capture des données en temps réel
 *     description: Lance la capture des données en temps réel à partir du port série et les envoie via WebSocket.
 *     tags:
 *       - "collecte"
 *     responses:
 *       200:
 *         description: Capture des données démarrée avec succès.
 *       500:
 *         description: Erreur lors du démarrage de la capture des données.
 */
// Route pour démarrer la capture des données
router.post('/donnees/capture', (req, res) => {
  try {
    // Passer l'objet `io` à la fonction de capture de données
    captureData(req.app.get('io')); // Ici, vous passez `io` pour gérer les WebSockets
    res.status(200).json({ message: 'Capture des données démarrée avec succès.' });
  } catch (err) {
    res.status(500).json({ message: 'Erreur lors du démarrage de la capture des données', error: err.message });
  }
});

// Route pour récupérer la moyenne journalière
router.get('/moyenne-journaliere/:date', getMoyenneJournaliere);

// Route pour récupérer la moyenne hebdomadaire
router.get('/moyenne-hebdomadaire/:startOfWeekDate', async (req, res) => {
  try {
    const { startOfWeekDate } = req.params; // Ex : '2024-11-24'
    const moyenneHebdomadaire = await getMoyenneHebdomadaire(startOfWeekDate);
    res.json(moyenneHebdomadaire);
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de la récupération de la moyenne hebdomadaire', error: error.message });
  }
});

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
router.get('/donnees',  getAllDonnees);
/**
 * @swagger
 * /donnees/monthly-average:
 *   get:
 *     summary: Récupérer les moyennes mensuelles
 *     description: Permet à un utilisateur ou un admin de récupérer les moyennes mensuelles des données de température et d'humidité.
 *     tags:
 *       - "collecte"
 *     responses:
 *       200:
 *         description: Moyennes mensuelles récupérées avec succès.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 averages:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                         example: "2024-11"
 *                       avgTemperature:
 *                         type: number
 *                         example: 25.3
 *                       avgHumidite:
 *                         type: number
 *                         example: 60
 *       404:
 *         description: Aucune donnée disponible pour les moyennes mensuelles.
 *       500:
 *         description: Erreur serveur.
 */
router.get('/donnees/monthly-average', getMonthlyAverage);
// Route pour récupérer les données du mois en cours
router.get('/donnees/mois-actuel', getCurrentMonthData);
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
router.get('/donnees/:id',  getDonneesById);


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
router.get('/donnees/daily-average', getDailyAverage);

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
router.get('/donnees/weekly-average', getWeeklyAverage);
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
router.get('/donnees/week/:date', getDataForWeek);

export default router;
