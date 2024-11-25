import Donnees from '../models/data.js';
import moment from 'moment'; // Pour travailler avec les semaines
import { SerialPort } from 'serialport';
import { ReadlineParser } from '@serialport/parser-readline';

const path = '/dev/ttyACM0'; // Le chemin du port série

const port = new SerialPort({
  path: '/dev/ttyACM1',
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

// Gérer l'événement de réception de données
parser.on('data', (data) => {
  console.log('Données reçues:', data);
});


// Fonction pour récupérer les données en temps réel et les émettre via WebSocket
export const captureData = (io) => {
  let dernierEnregistrement = null; // Stocker la dernière heure enregistrée

  parser.on('data', async (data) => {
    try {
      console.log('Données brutes reçues du port série:', data);

      const parsedData = JSON.parse(data);
      console.log('Données converties en JSON:', parsedData);

      if (typeof parsedData.temperature !== 'number' || typeof parsedData.humidite !== 'number') {
        console.error('Données invalides reçues:', parsedData);
        return;
      }

      const now = new Date();
      const heureActuelle = now.getHours();
      const minutesActuelles = now.getMinutes();
      const date = now.toISOString().split('T')[0];
      const heure = `${String(heureActuelle).padStart(2, '0')}:${String(minutesActuelles).padStart(2, '0')}`;

      // Liste des heures importantes
      const heuresImportantes = [10, 14, 17];

      // Vérifier si on doit enregistrer
      const doitEnregistrer =
        (minutesActuelles === 0 && dernierEnregistrement !== heureActuelle) || // Chaque heure pile
        (heuresImportantes.includes(heureActuelle) && dernierEnregistrement !== heureActuelle); // Heures importantes

      if (!doitEnregistrer) {
        console.log(`Aucune donnée enregistrée à ${heure} (${date}).`);
        return;
      }

      // Mettre à jour la dernière heure d'enregistrement
      dernierEnregistrement = heureActuelle;

      // Ajouter des valeurs par défaut pour les champs manquants
      const ventiloActive = parsedData.ventiloActive !== undefined ? parsedData.ventiloActive : false;
      const buzzer = parsedData.buzzer !== undefined ? parsedData.buzzer : false;
      const signal = parsedData.signal !== undefined ? parsedData.signal : false;

      // Créer un objet à enregistrer
      const donnees = new Donnees({
        date,
        heure,
        temperature: parsedData.temperature,
        humidite: parsedData.humidite,
        ventiloActive,
        buzzer,
        signal,
      });

      // Enregistrer dans MongoDB
      await donnees.save();
      console.log('Données enregistrées dans MongoDB:', donnees);

      // Émettre les données via WebSocket
      io.emit('nouvelleDonnee', donnees);
    } catch (err) {
      console.error('Erreur lors du traitement des données:', err);
    }
  });

  port.on('error', (err) => {
    console.error('Erreur sur le port série:', err);
  });
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
};
