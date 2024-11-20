import Donnees from '../models/data.js';
import moment from 'moment'; // Pour travailler avec les semaines


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


// Mettre à jour des données
export const updateDonnees = async (req, res) => {
  const id = req.params.id;
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
    const donnees = await Donnees.findById(id);
    if (!donnees) {
      return res.status(404).json({ message: 'Données non trouvées' });
    }

    // Mise à jour des champs
    donnees.date = date || donnees.date;
    donnees.heure = heure || donnees.heure;
    donnees.temperature = temperature !== undefined ? temperature : donnees.temperature;
    donnees.humidite = humidite !== undefined ? humidite : donnees.humidite;
    donnees.ventiloActive = ventiloActive !== undefined ? ventiloActive : donnees.ventiloActive;
    donnees.buzzer = buzzer !== undefined ? buzzer : donnees.buzzer;
    donnees.signal = signal !== undefined ? signal : donnees.signal;
    donnees.moyTemp = moyTemp || donnees.moyTemp;
    donnees.moyhum = moyhum || donnees.moyhum;

    const donneesMisesAJour = await donnees.save();
    res.status(200).json({ message: 'Données mises à jour avec succès', donnees: donneesMisesAJour });
  } catch (err) {
    res.status(500).json({ message: 'Erreur lors de la mise à jour des données', error: err.message });
  }
};

// Supprimer des données par ID
export const deleteDonnees = async (req, res) => {
  const id = req.params.id;

  try {
    const donnees = await Donnees.findById(id);
    if (!donnees) {
      return res.status(404).json({ message: 'Données non trouvées' });
    }

    await donnees.remove();
    res.status(200).json({ message: 'Données supprimées avec succès' });
  } catch (err) {
    res.status(500).json({ message: 'Erreur lors de la suppression des données', error: err.message });
  }
};
