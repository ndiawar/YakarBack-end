import Donnees from '../models/data.js';
import moment from 'moment'; // Pour travailler avec les semaines
import { SerialPort } from 'serialport';
import { ReadlineParser } from '@serialport/parser-readline';

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

// Gérer l'événement de réception de données
parser.on('data', (data) => {
  console.log('Données reçues:', data);
});


// Fonction pour récupérer les données en temps réel et les émettre via WebSocket
export const captureData = (io) => {
  parser.on('data', async (data) => {
    try {
      // Afficher les données brutes reçues du port série
      console.log('Données brutes reçues du port série:', data);

      // Convertir les données en JSON
      const parsedData = JSON.parse(data);
      console.log('Données converties en JSON:', parsedData);

      // Vérifier la validité des données reçues
      if (typeof parsedData.temperature !== 'number' || typeof parsedData.humidite !== 'number') {
        console.error('Données invalides reçues:', parsedData);
        return;
      }

      // Ajouter la date et l'heure actuelles
      const now = new Date();
      const date = now.toISOString().split('T')[0];
      const heure = now.toTimeString().split(' ')[0];
      console.log('Date et heure actuelles:', date, heure);

      // Créer un nouvel objet Donnees
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
      console.log('Données enregistrées dans MongoDB:', donnees);

      // Afficher les données avant de les émettre
      console.log('Émission des données via WebSocket:', donnees);

      // Émettre les données via WebSocket à tous les clients
      io.emit('nouvelleDonnee', donnees);

    } catch (err) {
      console.error('Erreur lors du traitement des données:', err);
    }
  });

  // Gestion des erreurs sur le port série
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
  captureData,
};
