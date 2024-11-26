import mongoose from 'mongoose';
import Donnees from '../models/data.js'; // Assurez-vous que le modèle Donnees est correctement importé
import { SerialPort } from 'serialport';
import { ReadlineParser } from '@serialport/parser-readline';
import moment from 'moment';


const path = '/dev/ttyUSB0'; // Le chemin du port série

const port = new SerialPort({
  path: '/dev/ttyUSB0',
  baudRate: 9600,
  autoOpen: false
});

// Ouvrir le port série
port.open((err) => {
  if (err) {
    console.error('Erreur de connexion au port série:', err);
  } else {
    console.log('Connexion au port série réussie');
  }
});

// Initialiser le parser pour lire les données ligne par ligne
const parser = port.pipe(new ReadlineParser({ delimiter: '\n' }));

// Liste des heures importantes (par exemple : 1:05, 1:10, 1:15)
const heuresImportantes = [
  { heure: 20, minute: 40 },
  { heure: 20, minute: 42 },
  { heure: 20, minute: 46 },
];

// Fonction pour récupérer les données en temps réel et les émettre via WebSocket
export const captureData = (io) => {
  let dernierEnregistrement = {}; // Un objet pour stocker les heures importantes enregistrées

  parser.on('data', async (data) => {
    try {
      // Vérification si les données sont valides
      if (!data || data.trim() === '') {
        console.error('Aucune donnée valide reçue');
        return;
      }

      console.log('Données brutes reçues du port série:', data);

      // Conversion des données en JSON
      let parsedData;
      try {
        parsedData = JSON.parse(data);
      } catch (parseError) {
        console.error('Erreur lors du parsing des données:', data);
        return;
      }

      console.log('Données converties en JSON:', parsedData);

      // Vérification des champs essentiels
      if (typeof parsedData.temperature !== 'number' || typeof parsedData.humidite !== 'number') {
        console.error('Données invalides reçues:', parsedData);
        return;
      }

      const now = new Date();
      const heureActuelle = now.getHours();
      const minutesActuelles = now.getMinutes();
      const date = now.toISOString().split('T')[0];
      const heure = `${String(heureActuelle).padStart(2, '0')}:${String(minutesActuelles).padStart(2, '0')}`;

      // Vérification si c'est une heure importante
      const estHeureImportante = heuresImportantes.some(
        ({ heure, minute }) => heure === heureActuelle && minute === minutesActuelles
      );

      if (!estHeureImportante) {
        console.log(`Aucune donnée enregistrée à ${heure}.`);
        return;
      }

      // Mise à jour de la dernière heure enregistrée
      dernierEnregistrement[`${heureActuelle}:${minutesActuelles}`] = parsedData;

      // Vérification si toutes les heures importantes ont été enregistrées
      const heuresEnregistrees = Object.keys(dernierEnregistrement);
      if (heuresEnregistrees.length === heuresImportantes.length) {
        // Calcul des moyennes de température et d'humidité
        const temperatures = heuresEnregistrees.map((key) => dernierEnregistrement[key].temperature);
        const humidites = heuresEnregistrees.map((key) => dernierEnregistrement[key].humidite);

        const moyTemp = temperatures.reduce((sum, temp) => sum + temp, 0) / temperatures.length;
        const moyHum = humidites.reduce((sum, hum) => sum + hum, 0) / humidites.length;

        // Création de l'objet à enregistrer dans la base de données avec la moyenne
        const donnees = new Donnees({
          date,
          heure: heuresEnregistrees.join(', '), // Affiche les heures d'enregistrement
          temperature: temperatures[temperatures.length - 1], // On prend la dernière température
          humidite: humidites[humidites.length - 1], // On prend la dernière humidité
          moyTemp,
          moyHum,
        });

        // Enregistrement dans MongoDB
        try {
          await donnees.save();
          console.log('Données enregistrées dans MongoDB:', donnees);

          // Réinitialisation après enregistrement des 3 heures
          dernierEnregistrement = {};

          // Émission des données via WebSocket
          io.emit('nouvelleDonnee', {
            date,
            heure: donnees.heure,
            temperature: donnees.temperature,
            humidite: donnees.humidite,
            moyTemp,
            moyHum,
          });
        } catch (dbError) {
          console.error('Erreur lors de l\'enregistrement dans MongoDB:', dbError);
          io.emit('erreurEnregistrement', { message: 'Erreur lors de l\'enregistrement des données', details: dbError });
        }
      }
    } catch (error) {
      console.error('Erreur lors du traitement des données:', error);
    }
  });
};

export const getMoyenneJournaliere = async (req, res) => {
  const { date } = req.params; // Récupère la date depuis les paramètres de la requête.

  try {
    // Convertir la date en format ISO pour effectuer une recherche
    const startOfDay = moment(date).startOf('day').toDate();
    const endOfDay = moment(date).endOf('day').toDate();

    // Trouver les enregistrements correspondant aux heures importantes pour cette date
    const donnees = await Donnees.find({
      date: { $gte: startOfDay, $lte: endOfDay },
      heure: { $in: ['20:40', '20:42', '20:46'] } // Les heures importantes à prendre en compte
    });

    // Logique pour s'assurer que nous avons les données nécessaires
    const donneesDistinctes = [];
    const heuresImportantes = ['20:40', '20:42', '20:46'];

    heuresImportantes.forEach(heure => {
      const donneePourHeure = donnees.filter(d => d.heure === heure)[0]; // Récupère la première donnée pour chaque heure
      if (donneePourHeure) {
        donneesDistinctes.push(donneePourHeure);
      }
    });

    // Si nous avons bien les 3 enregistrements nécessaires
    if (donneesDistinctes.length === 3) {
      const moyTemp = donneesDistinctes.reduce((sum, item) => sum + item.temperature, 0) / donneesDistinctes.length;
      const moyHum = donneesDistinctes.reduce((sum, item) => sum + item.humidite, 0) / donneesDistinctes.length;

      // Retourne la moyenne calculée
      return res.json({
        date,
        moyTemp,
        moyHum,
      });
    } else {
      return res.status(404).send('Pas toutes les données des heures importantes disponibles pour cette journée');
    }
  } catch (error) {
    console.error('Erreur lors de la récupération de la moyenne journalière:', error);
    return res.status(500).send('Erreur lors de la récupération des moyennes journalières');
  }
};

// Récupérer la moyenne des trois heures importantes pour chaque jour de la semaine
export const getMoyenneHebdomadaire = async () => {
  try {
    const startDate = moment('2024-11-11'); // Date de début (11 novembre 2024)
    const endDate = moment('2024-11-30'); // Date de fin (30 novembre 2024)

    // Heures spécifiques que nous recherchons pour chaque jour
    const heuresImportantes = ['20:40', '20:42', '20:46'];

    // Variable pour stocker les moyennes de chaque semaine
    let moyennesHebdo = [];

    // On boucle sur chaque semaine entre le 11 novembre et le 30 novembre
    let currentStartDate = startDate.clone();
    while (currentStartDate.isBefore(endDate)) {
      // Définir le début et la fin de la semaine actuelle
      const startOfWeek = currentStartDate.startOf('week').toDate(); // Lundi de la semaine
      const endOfWeek = currentStartDate.endOf('week').toDate(); // Dimanche de la semaine

      // Récupérer toutes les données de la semaine
      const donnees = await Donnees.find({
        date: { $gte: startOfWeek, $lte: endOfWeek },
      });

      if (donnees.length === 0) {
        // S'il n'y a pas de données pour cette semaine, on passe à la semaine suivante
        currentStartDate.add(1, 'week'); // Passer à la semaine suivante
        continue;
      }

      // Regrouper les données par jour
      const donneesParJour = {};
      donnees.forEach(item => {
        const jour = moment(item.date).format('YYYY-MM-DD'); // Format de la date pour regroupement
        if (!donneesParJour[jour]) {
          donneesParJour[jour] = [];
        }
        donneesParJour[jour].push(item);
      });

      // Vérifier que toutes les heures importantes sont présentes pour chaque jour
      const joursComplet = Object.keys(donneesParJour).every(jour => {
        const heuresPresentes = donneesParJour[jour].map(item => item.heure);
        return heuresImportantes.every(heure => heuresPresentes.includes(heure));
      });

      if (!joursComplet) {
        // Si toutes les données journalières ne sont pas présentes, on passe à la semaine suivante
        currentStartDate.add(1, 'week');
        continue;
      }

      // Calcul des moyennes pour cette semaine
      let totalTemp = 0;
      let totalHum = 0;
      let count = 0;

      Object.values(donneesParJour).forEach(donneesJour => {
        // Calculer la moyenne journalière pour chaque jour
        const moyTemp = donneesJour.reduce((sum, item) => sum + item.temperature, 0) / donneesJour.length;
        const moyHum = donneesJour.reduce((sum, item) => sum + item.humidite, 0) / donneesJour.length;

        totalTemp += moyTemp;
        totalHum += moyHum;
        count++;
      });

      // Calcul de la moyenne hebdomadaire
      const moyTempHebdo = totalTemp / count;
      const moyHumHebdo = totalHum / count;

      moyennesHebdo.push({
        semaine: `Semaine du ${moment(startOfWeek).format('DD/MM/YYYY')} au ${moment(endOfWeek).format('DD/MM/YYYY')}`,
        moyTempHebdo,
        moyHumHebdo,
      });

      // Passer à la semaine suivante
      currentStartDate.add(1, 'week');
    }

    // Retourner les moyennes de chaque semaine
    return moyennesHebdo;

  } catch (error) {
    console.error('Erreur lors de la récupération de la moyenne hebdomadaire:', error);
    throw error;
  }
};

// Récupérer toutes les données
export const getAllDonnees = async (req, res) => {
  try {
    const donnees = await Donnees.find();
    res.status(200).json({ donnees });
  } catch (err) {
    res.status(500).json({ message: 'Erreur lors de la récupération des données', error: err.message });
  }
};
// Récupérer les données par ID
export const getDonneesById = async (req, res) => {
  const id = req.params.id;

  try {
    const donnees = await Donnees.findById(id);
    if (!donnees) {
      return res.status(404).json({ message: 'Données non trouvées' });
    }
    res.status(200).json({ donnees });
  } catch (err) {
    res.status(500).json({ message: 'Erreur lors de la récupération des données', error: err.message });
  }
};
export const getWeeklyData = async (req, res) => {
  try {
    const { weekType } = req.params;

    // Filtrer les week-ends
    const filter = weekType === 'weekend' ? { dayOfWeek: { $in: [6, 0] } } : {}; // 6 = Samedi, 0 = Dimanche

    const data = await Donnees.aggregate([
      {
        $addFields: {
          dayOfWeek: { $dayOfWeek: { $dateFromString: { dateString: "$date" } } },
        },
      },
      { $match: filter },
    ]);

    res.json({ data });
  } catch (error) {
    console.error('Erreur lors de la récupération des données hebdomadaires:', error);
    res.status(500).json({ message: 'Erreur serveur', details: error });
  }
};






// Calculer la moyenne journalière
// export const getDailyAverage = async (req, res) => {
//   try {
//     const averages = await Donnees.aggregate([
//       {
//         $group: {
//           _id: "$date",
//           avgTemperature: { $avg: "$temperature" },
//           avgHumidite: { $avg: "$humidite" },
//         },
//       },
//       {
//         $sort: { _id: 1 }, // Trier par date croissante
//       },
//     ]);

//     res.status(200).json({ averages });
//   } catch (err) {
//     res.status(500).json({ message: 'Erreur lors du calcul de la moyenne journalière', error: err.message });
//   }
// };
export const getDailyAverage = async (req, res) => {
  try {
    const averages = await Donnees.aggregate([
      {
        $addFields: {
          jour: { $dateToString: { format: "%Y-%m-%d", date: "$date" } },
        },
      },
      {
        $group: {
          _id: "$jour",
          avgTemperature: { $avg: "$temperature" },
          avgHumidite: { $avg: "$humidite" },
        },
      },
      { $sort: { _id: 1 } }, // Tri par date
    ]);

    if (averages.length === 0) {
      // Si aucune donnée n'est trouvée
      return res.status(404).json({
        message: "Aucune donnée disponible pour les moyennes journalières.",
      });
    }

    res.status(200).json({ averages });
  } catch (err) {
    console.error("Erreur lors du calcul de la moyenne journalière:", err);
    res.status(500).json({
      message: "Erreur lors du calcul de la moyenne journalière",
      error: err.message,
    });
  }
};

export const getMonthlyAverage = async (req, res) => {
  try {
    const averages = await Donnees.aggregate([
      {
        $addFields: {
          mois: { $dateToString: { format: "%Y-%m", date: "$date" } },  // Regroupement par mois
        },
      },
      {
        $group: {
          _id: "$mois",
          avgTemperature: { $avg: "$temperature" },
          avgHumidite: { $avg: "$humidite" },
        },
      },
      { $sort: { _id: 1 } },  // Tri par mois
    ]);

    if (averages.length === 0) {
      return res.status(404).json({
        message: "Aucune donnée disponible pour les moyennes mensuelles.",
      });
    }

    res.status(200).json({ averages });
  } catch (err) {
    console.error("Erreur lors du calcul de la moyenne mensuelle:", err);
    res.status(500).json({
      message: "Erreur lors du calcul de la moyenne mensuelle",
      error: err.message,
    });
  }
};


// Récupérer les données du mois en cours
export const getCurrentMonthData = async (req, res) => {
  try {
    // Récupérer les paramètres de pagination
    const page = parseInt(req.query.page) || 1;
    const pageSize = parseInt(req.query.pageSize) || 6;
    const skip = (page - 1) * pageSize;

    // Obtenez le premier jour et le dernier jour du mois en cours
    const startOfMonth = moment().startOf('month').format('YYYY-MM-DD');
    const endOfMonth = moment().endOf('month').format('YYYY-MM-DD');

    // Filtrer les données dans la collection Donnees avec pagination
    const currentMonthData = await Donnees.find({
      date: { $gte: startOfMonth, $lte: endOfMonth },
    })
      .skip(skip)
      .limit(pageSize);

    if (currentMonthData.length === 0) {
      return res.status(404).json({
        message: "Aucune donnée disponible pour le mois en cours.",
      });
    }

    // Retourner les données avec pagination
    res.status(200).json({ currentMonthData });
  } catch (err) {
    console.error("Erreur lors de la récupération des données du mois en cours :", err);
    res.status(500).json({
      message: "Erreur lors de la récupération des données du mois en cours",
      error: err.message,
    });
  }
};


// Calculer la moyenne hebdomadaire
export const getWeeklyAverage = async (req, res) => {
  try {
    const averages = await Donnees.aggregate([
      {
        $addFields: {
          week: { $isoWeek: { $dateFromString: { dateString: "$date" } } }, // Extraire la semaine de la date
          year: { $year: { $dateFromString: { dateString: "$date" } } }, // Extraire l'année pour différencier les semaines d'années différentes
        },
      },
      {
        $group: {
          _id: { week: "$week", year: "$year" },
          avgTemperature: { $avg: "$temperature" },
          avgHumidite: { $avg: "$humidite" },
        },
      },
      {
        $sort: { "_id.year": 1, "_id.week": 1 }, // Trier par année et semaine
      },
    ]);

    res.status(200).json({ averages });
  } catch (err) {
    res.status(500).json({ message: 'Erreur lors du calcul de la moyenne hebdomadaire', error: err.message });
  }
};

// Filtrer les données pour la semaine
export const getDataForWeek = async (req, res) => {
  const { date } = req.params; // Date au format YYYY-MM-DD
  try {
    const startOfWeek = moment(date).startOf('isoWeek').format('YYYY-MM-DD');
    const endOfWeek = moment(date).endOf('isoWeek').format('YYYY-MM-DD');

    const data = await Donnees.find({
      date: { $gte: startOfWeek, $lte: endOfWeek },
    });

    res.status(200).json({ weekData: data });
  } catch (err) {
    res.status(500).json({ message: 'Erreur lors du filtrage des données pour la semaine', error: err.message });
  }
};

// Exporter toutes les fonctions
export default {
  getDailyAverage,
  getWeeklyAverage,
  getDataForWeek,
  captureData,
  getMoyenneHebdomadaire,
  getMoyenneJournaliere
};
