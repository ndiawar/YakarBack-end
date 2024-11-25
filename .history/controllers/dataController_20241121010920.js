import Donnees from '../models/data.js';
import moment from 'moment'; // Pour travailler avec les semaines
import SerialPort from 'serialport';
import ReadlineParser from '@serialport/parser-readline';

// Initialisation du port série
const port = new SerialPort('/dev/ttyUSB0', { baudRate: 9600 });
const parser = port.pipe(new ReadlineParser({ delimiter: '\n' }));

// Fonction pour récupérer les données en temps réel
export const captureData = (io) => {
  parser.on('data', async (data) => {
    try {
      // Convertir les données en JSON
      const parsedData = JSON.parse(data);

      // Ajouter la date et l'heure actuelles
      const now = new Date();
      const date = now.toISOString().split('T')[0];
      const heure = now.toTimeString().split(' ')[0];

      const donnees = new Donnees({
        date,
        heure,
        temperature: parsedData.temperature,
        humidite: parsedData.humidite,
        ventiloActive: parsedData.ventiloActive,
        buzzer: parsedData.buzzer,
        signal: parsedData.signal,
      });

      // Enregistrer dans MongoDB
      await donnees.save();

      // Émettre les données via WebSocket
      io.emit('nouvelleDonnee', {
        temperature: parsedData.temperature,
        humidite: parsedData.humidite,
        ventiloActive: parsedData.ventiloActive,
        buzzer: parsedData.buzzer,
      });

      console.log('Données enregistrées :', donnees);
    } catch (err) {
      console.error('Erreur lors du traitement des données :', err);
    }
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

// Créer de nouvelles données
export const createDonnees = async (req, res) => {
  const {
    date,
    heure,
    temperature,
    humidite,
    ventiloActive,
    buzzer,
    signal,
    moyTemp,
    moyhum,
  } = req.body;

  try {
    const nouvellesDonnees = new Donnees({
      date,
      heure,
      temperature,
      humidite,
      ventiloActive,
      buzzer,
      signal,
      moyTemp,
      moyhum,
    });

    const donneesSauvegardees = await nouvellesDonnees.save();
    res.status(201).json({ message: 'Données créées avec succès', donnees: donneesSauvegardees });
  } catch (err) {
    res.status(500).json({ message: 'Erreur lors de la création des données', error: err.message });
  }
};


// Calculer la moyenne journalière
export const getDailyAverage = async (req, res) => {
  try {
    const averages = await Donnees.aggregate([
      {
        $group: {
          _id: "$date",
          avgTemperature: { $avg: "$temperature" },
          avgHumidite: { $avg: "$humidite" },
        },
      },
      {
        $sort: { _id: 1 }, // Trier par date croissante
      },
    ]);

    res.status(200).json({ averages });
  } catch (err) {
    res.status(500).json({ message: 'Erreur lors du calcul de la moyenne journalière', error: err.message });
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
};
