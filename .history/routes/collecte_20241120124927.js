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
 *     tags:
 *       - "collecte"
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
 *        201:
 *          description: Donnée créée avec succès.
 *        400:
 *          description: Mauvaise demande.
 */
router.post('/donnees', authMiddleware, roleMiddleware('admin'), createDonnees);

/**
 * @swagger
 * /donnees/{id}:
 *   delete:
 *     summary: Supprimer une donnée
 *     description: Permet à un admin de supprimer une donnée par son ID.
 *     tags:
 *       - "collecte"
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
 *     description: Filtre les données pour la semaine contenant la date spécifiée.
 *     tags:
 *       - "collecte"
 *     parameters:
 *       - in: path
 *         name: date
 *         required: true
 *         description: Date (format : YYYY-MM-DD) pour filtrer la semaine (Lundi à Dimanche).
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
router.get('/donnees/week/:date', authMiddleware, roleMiddleware('admin', 'user'), getWeekData);

export default router;
