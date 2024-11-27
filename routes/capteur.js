import express from 'express';
const router = express.Router();
import CapteurData from '../models/capteurData.js';
import moment from 'moment';
const validDate = new Date("2024-11-20"); // Valide
import { SerialPort, ReadlineParser } from 'serialport';




// Enregistrement d'un nouveau capteurData
router.post('/', async (req, res) => {
  try {
    const { date, heure, temperature, humidite } = req.body;

    const newCapteurData = new CapteurData({
      date,
      heure,
      temperature,
      humidite,
    });

    await newCapteurData.save();
    res.status(201).json({ message: 'CapteurData enregistré avec succès' });
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de l\'enregistrement', error });
  }
});

// Route pour obtenir les données par jour
router.get('/daily/:date', async (req, res) => {
    const { date } = req.params;
    try {
      const data = await CapteurData.aggregate([
        { $match: { date: date } },
        { $group: {
            _id: { heure: "$heure" },
            avgTemperature: { $avg: "$temperature" },
            avgHumidite: { $avg: "$humidite" }
          }},
        { $sort: { "_id.heure": 1 } }
      ]);
      res.json(data);
    } catch (err) {
      res.status(500).send('Erreur serveur');
    }
  });
  
  // Route pour obtenir les données par mois


// Route pour récupérer la moyenne de température et d'humidité
router.get('/monthly/:month/:year', async (req, res) => {
  const { month, year } = req.params;

  // Valider les paramètres
  if (!month || !year || isNaN(month) || isNaN(year)) {
    return res.status(400).json({ message: 'Paramètres invalides : spécifiez un mois et une année valides.' });
  }

  try {
    // Rechercher les données correspondant au mois et à l'année spécifiés
    const startDate = `${year}-${month.padStart(2, '0')}-01`; // Début du mois
    const endDate = `${year}-${month.padStart(2, '0')}-31`;  // Fin approximative du mois

    const data = await CapteurData.find({
      date: { $gte: startDate, $lte: endDate }
    });

    if (data.length === 0) {
      return res.status(404).json({ message: 'Aucune donnée trouvée pour cette période.' });
    }

    // Calculer les moyennes
    const totalTemperature = data.reduce((sum, record) => sum + record.temperature, 0);
    const totalHumidite = data.reduce((sum, record) => sum + record.humidite, 0);

    const averageTemperature = totalTemperature / data.length;
    const averageHumidite = totalHumidite / data.length;

    // Répondre avec les moyennes
    res.status(200).json({
      month,
      year,
      averageTemperature: averageTemperature.toFixed(2),
      averageHumidite: averageHumidite.toFixed(2),
      dataPoints: data.length
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des moyennes :', error);
    res.status(500).json({ message: 'Erreur serveur.', error: error.message });
  }
});


  
  // Route pour obtenir les données par année
  router.get('/yearly/:year', async (req, res) => {
    const { year } = req.params;
  
    // Valider le paramètre d'année
    if (!year || isNaN(year)) {
      return res.status(400).json({ message: 'Paramètre invalide : spécifiez une année valide.' });
    }
  
    try {
      // Rechercher les données correspondant à l'année spécifiée
      const startDate = `${year}-01-01`; // Début de l'année
      const endDate = `${year}-12-31`;  // Fin de l'année
  
      const data = await CapteurData.find({
        date: { $gte: startDate, $lte: endDate }
      });
  
      if (data.length === 0) {
        return res.status(404).json({ message: 'Aucune donnée trouvée pour cette année.' });
      }
  
      // Calculer les moyennes
      const totalTemperature = data.reduce((sum, record) => sum + record.temperature, 0);
      const totalHumidite = data.reduce((sum, record) => sum + record.humidite, 0);
  
      const averageTemperature = totalTemperature / data.length;
      const averageHumidite = totalHumidite / data.length;
  
      // Répondre avec les moyennes
      res.status(200).json({
        year,
        averageTemperature: averageTemperature.toFixed(2),
        averageHumidite: averageHumidite.toFixed(2),
        dataPoints: data.length
      });
    } catch (error) {
      console.error('Erreur lors de la récupération des moyennes :', error);
      res.status(500).json({ message: 'Erreur serveur.', error: error.message });
    }
  });

  router.get('/monthly-week/:month/:year/:weekNumber', async (req, res) => {
    const { month, year, weekNumber } = req.params;
  
    // Validation des paramètres
    if (!month || !year || !weekNumber || isNaN(month) || isNaN(year) || isNaN(weekNumber)) {
      return res.status(400).json({ message: 'Paramètres invalides. Assurez-vous que tous les paramètres sont valides.' });
    }
  
    // Calculer la première date du mois et la date de la semaine demandée
    const startOfMonth = moment().year(year).month(month - 1).startOf('month');
    const startOfWeek = startOfMonth.clone().add((weekNumber - 1) * 7, 'days');  // Première date de la semaine
    const endOfWeek = startOfWeek.clone().add(6, 'days');  // Dernière date de la semaine
  
    // Vérifier que la semaine demandée est valide
    if (startOfWeek.month() !== startOfMonth.month()) {
      return res.status(400).json({ message: 'Numéro de semaine invalide pour ce mois.' });
    }
  
    try {
      // Rechercher les données pour la semaine spécifiée
      const data = await CapteurData.find({
        date: { $gte: startOfWeek.format('YYYY-MM-DD'), $lte: endOfWeek.format('YYYY-MM-DD') }
      });
  
      if (data.length === 0) {
        return res.status(404).json({ message: 'Aucune donnée trouvée pour cette semaine.' });
      }
  
      // Calculer les moyennes
      const totalTemperature = data.reduce((sum, record) => sum + record.temperature, 0);
      const totalHumidite = data.reduce((sum, record) => sum + record.humidite, 0);
  
      const averageTemperature = totalTemperature / data.length;
      const averageHumidite = totalHumidite / data.length;
  
      // Répondre avec les moyennes
      res.status(200).json({
        year,
        month,
        weekNumber,
        startOfWeek: startOfWeek.format('YYYY-MM-DD'),
        endOfWeek: endOfWeek.format('YYYY-MM-DD'),
        averageTemperature: averageTemperature.toFixed(2),
        averageHumidite: averageHumidite.toFixed(2),
        dataPoints: data.length
      });
    } catch (error) {
      console.error('Erreur lors de la récupération des moyennes :', error);
      res.status(500).json({ message: 'Erreur serveur.', error: error.message });
    }
  });

  router.post('/weekly-average', async (req, res) => {
    const { year, month, week } = req.body;
  
    // Validation des entrées
    if (!year || !month || !week) {
      return res.status(400).json({ message: 'Année, mois et semaine requis.' });
    }
  
    try {
      // Calcul des dates limites de la semaine
      const startDate = new Date(`${year}-${month}-01`);
      if (isNaN(startDate.getTime())) {
        throw new Error('Date invalide.');
      }
  
      // Trouver le lundi de la semaine sélectionnée
      const weekStart = new Date(startDate.setDate((week - 1) * 7 + 1));
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekEnd.getDate() + 6); // Dimanche de la semaine
  
      // Filtrer les données par plage de dates
      const data = await CapteurData.aggregate([
        {
          $match: {
            date: { 
              $gte: weekStart.toISOString().split('T')[0], 
              $lte: weekEnd.toISOString().split('T')[0] 
            },
          },
        },
        {
          $addFields: {
            date: { $dateFromString: { dateString: "$date" } }  // Conversion explicite de date en Date
          }
        },
        {
          $group: {
            _id: { $dayOfWeek: "$date" },  // Group par jour de la semaine
            avgTemperature: { $avg: '$temperature' },
            avgHumidite: { $avg: '$humidite' },
          },
        },
        {
          $sort: { "_id": 1 } // Trier par jour de la semaine
        }
      ]);

      // Transformation des données pour correspondre au format attendu par le frontend
      const avgTemperatures = new Array(7).fill(0);  // Crée un tableau de 7 éléments (un pour chaque jour)
      const avgHumidites = new Array(7).fill(0); // Crée un tableau pour l'humidité
  
      // Remplir les jours avec les valeurs de la base de données
      data.forEach(item => {
        const dayOfWeek = item._id - 1;  // MongoDB renvoie 1 (dimanche) à 7 (samedi)
        avgTemperatures[dayOfWeek] = item.avgTemperature || 0; // Remplacer les valeurs avec celles des données
        avgHumidites[dayOfWeek] = item.avgHumidite || 0; // Idem pour l'humidité
      });
  
      // Retourner les données dans le format attendu
      res.status(200).json({
        avgTemperatures: avgTemperatures,
        avgHumidites: avgHumidites
      });
    } catch (error) {
      res.status(500).json({ message: 'Erreur serveur.', error: error.message });
    }
});

router.get('/latest-data', async (req, res) => {
    try {
      // Heures spécifiques à rechercher
      const targetHours = ['10h', '14h', '17h'];
  
      // Recherche des derniers enregistrements pour chaque heure cible
      const latestData = await Promise.all(
        targetHours.map(async (hour) => {
          return await CapteurData.findOne({ heure: hour })
            .sort({ date: -1 }) // Trie par date décroissante pour obtenir la dernière
            .select('date heure temperature humidite -_id'); // Sélectionne uniquement les champs requis
        })
      );
  
      // Filtrer les données valides (au cas où il n'y aurait pas de données pour une heure spécifique)
      const filteredData = latestData.filter((data) => data !== null);
  
      return res.status(200).json({
        message: 'Données récupérées avec succès.',
        data: filteredData,
      });
    } catch (error) {
      console.error('Erreur lors de la récupération des données:', error);
      return res.status(500).json({ message: 'Erreur serveur.', error: error.message });
    }
  });

  router.get('/last-day-data', async (req, res) => {
    try {
      // Trouver la dernière date enregistrée
      const lastRecord = await CapteurData.findOne().sort({ date: -1 }).exec();
      if (!lastRecord) {
        return res.status(404).json({ message: 'Aucune donnée trouvée.' });
      }
  
      const lastDate = lastRecord.date;
  
      // Récupérer les données pour la dernière date aux heures spécifiques
      const specificHours = ['10:00:00', '14:00:00', '17:00:00'];
      const data = await CapteurData.find({
        date: lastDate,
        heure: { $in: specificHours },
      }).select('heure temperature humidite -_id').exec();
  
      if (data.length === 0) {
        return res.status(404).json({ message: 'Aucune donnée disponible pour les heures spécifiées.' });
      }
  
      // Formater les heures pour renvoyer sans les secondes (HH:mm)
      data.forEach((record) => {
        record.heure = record.heure.slice(0, 5); // On enlève les secondes
      });
  
      res.status(200).json({
        message: 'Données récupérées avec succès.',
        date: lastDate,
        data,
      });
    } catch (error) {
      console.error('Erreur lors de la récupération des données :', error);
      res.status(500).json({ message: 'Erreur serveur', error: error.message });
    }
  });


  // Configuration du port série pour la connexion avec l'Arduino
  const arduinoPort = new SerialPort({
    path: '/dev/ttyUSB0', // Chemin vers le port série
    baudRate: 9600,       // Taux de transmission
  }); // Remplacez `/dev/ttyUSB0` par le port correct
  const parser = arduinoPort.pipe(new ReadlineParser({ delimiter: '\n' })); // Analyse les lignes terminées par un saut de ligne

  const normalizeTime = (rawTime) => {
    // Récupère l'heure formatée HH:mm (pas besoin de secondes)
    const [hours, minutes] = rawTime.split(':').map(val => parseInt(val, 10));
    const normalizedHours = hours.toString().padStart(2, '0');
    const normalizedMinutes = minutes.toString().padStart(2, '0');
    
    return `${normalizedHours}:${normalizedMinutes}:00`; // On renvoie l'heure avec secondes toujours 00
  };

// Vérifie si l'heure actuelle correspond aux heures définies
const shouldSaveData = (heureActuelle) => {
  const heuresCibles = ['00:00:00', '01:00:00', '02:00:00', '03:00:00', '04:00:00', '05:00:00', '06:00:00', '07:00:00', '08:00:00', '09:00:00', '10:00:00', '11:00:00', '12:00:00', '13:00:00', '14:00:00', '15:00:00', '16:00:00', '17:00:00', '18:00:00', '19:00:00', '20:00:00', '21:00:00', '22:00:00', '23:00:00']; // Heures avec secondes
  return heuresCibles.includes(heureActuelle);
};

// Route POST pour recevoir les données
router.post('/realTime', async (req, res) => {
  try {
    const { date, heure, temperature, humidite, ventiloActive, buzzer, signal } = req.body;

    // Vérifie si l'heure correspond
    if (shouldSaveData(heure)) {
      const newCapteurData = new CapteurData({
        date,
        heure,
        temperature,
        humidite,
        ventiloActive,
        buzzer,
        signale: signal,
      });

      await newCapteurData.save();
      return res.status(201).json({ message: 'Données enregistrées avec succès.' });
    }

    res.status(200).json({ message: 'Données ignorées, heure non correspondante.' });
  } catch (error) {
    console.error('Erreur lors de l’enregistrement:', error);
    res.status(500).json({ error: 'Erreur interne du serveur.' });
  }
});

// Fonction pour envoyer l'heure actuelle au format "HH:mm:ss"
const getCurrentTime = () => {
  return moment().format('HH:mm:ss'); // Exemple : 11:58:00
};



// Lors de chaque réception de données de l'Arduino
parser.on('data', async (line) => {
  try {
    console.log(`Données reçues de l'Arduino : ${line}`);
    const data = JSON.parse(line.trim()); // Convertir la ligne JSON en objet

    // Synchronisation de l'heure avec celle du serveur
    const currentTime = getCurrentTime(); // Récupérer l'heure actuelle du serveur
    console.log(`Heure actuelle du serveur : ${currentTime}`);

    const dateActuelle = moment().format('YYYY-MM-DD'); // Date actuelle au format YYYY-MM-DD

    const { temperature, humidite, ventiloActive, buzzer, signal } = data;

    // Formater l'heure pour qu'elle corresponde à "HH:mm:ss"
    const heureReformatee = currentTime; // Utiliser l'heure du serveur

    console.log(`Heure normalisée : ${heureReformatee}`);

    if (shouldSaveData(heureReformatee)) {
      const newCapteurData = new CapteurData({
        date: dateActuelle,
        heure: heureReformatee,
        temperature,
        humidite,
        ventiloActive,
        buzzer,
        signale: signal ? 'rouge' : 'vert', // Ajuster en fonction de votre logique
      });

      await newCapteurData.save();
      console.log('Données enregistrées avec succès dans MongoDB.');
    } else {
      console.log('Données ignorées, heure non correspondante.');
    }
  } catch (error) {
    console.error('Erreur lors du traitement des données Arduino :', error);
  }
});

// Fonction pour envoyer l'heure au format "HH:mm:ss" à l'Arduino toutes les minutes
setInterval(() => {
  const currentTime = getCurrentTime(); // Heure actuelle du serveur
  arduinoPort.write(currentTime + '\n'); // Envoi de l'heure au format "HH:mm:ss" à l'Arduino
}, 60000); // Envoie l'heure toutes les 60 secondes

// Route POST pour activer/désactiver le ventilateur
// Route pour contrôler le ventilateur
// router.post('/control-fan', async (req, res) => {
//   try {
//     const { action } = req.body;  // "ON" ou "OFF" pour le ventilateur

//     if (action === 'ON') {
//       // Allumer le ventilateur
//       arduinoPort.write('ventilo:ON\n');
//       return res.status(200).json({ message: 'Ventilateur allumé' });
//     } else if (action === 'OFF') {
//       // Éteindre le ventilateur
//       arduinoPort.write('ventilo:OFF\n');
//       return res.status(200).json({ message: 'Ventilateur éteint' });
//     } else {
//       return res.status(400).json({ error: 'Action invalide. Utilisez "ON" ou "OFF".' });
//     }
//   } catch (error) {
//     console.error('Erreur lors du contrôle du ventilateur:', error);
//     res.status(500).json({ error: 'Erreur interne du serveur.' });
//   }
// });

router.post('/control-fan', async (req, res) => {
  try {
    const { action } = req.body;  // "ON" ou "OFF" pour le ventilateur

    if (action === 'ON') {
      // Allumer le ventilateur
      arduinoPort.write('ventilo:ON\n');
      return res.status(200).json({ message: 'Ventilateur allumé' });
    } else if (action === 'OFF') {
      // Éteindre le ventilateur
      arduinoPort.write('ventilo:OFF\n');
      return res.status(200).json({ message: 'Ventilateur éteint' });
    } else {
      return res.status(400).json({ error: 'Action invalide. Utilisez "ON" ou "OFF".' });
    }
  } catch (error) {
    console.error('Erreur lors du contrôle du ventilateur:', error);
    res.status(500).json({ error: 'Erreur interne du serveur.' });
  }
});

router.get('/data', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1; // Pagination : numéro de la page
    const limit = parseInt(req.query.limit) || 10; // Pagination : taille de la page
    const skip = (page - 1) * limit;

    const totalRecords = await CapteurData.countDocuments();
    const data = await CapteurData.find()
      .sort({ date: -1, heure: -1 }) // Tri par date et heure décroissantes
      .skip(skip)
      .limit(limit);

    res.status(200).json({ totalRecords, data });
  } catch (error) {
    console.error('Erreur lors de la récupération des données :', error);
    res.status(500).json({ error: 'Erreur lors de la récupération des données.' });
  }
});






export default router;
