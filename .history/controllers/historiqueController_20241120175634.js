import Historique from '../models/historique.js';
import User from '../models/user.js'; // Pour récupérer les informations de l'utilisateur

// Fonction pour enregistrer une action dans l'historique
export const logAction = async (userId, action) => {
  try {
    // Récupérer l'utilisateur connecté pour obtenir ses infos
    const user = await User.findById(userId);

    if (!user) {
      console.error("Utilisateur non trouvé pour l'enregistrement d'historique");
      return;
    }

    // Créer une nouvelle entrée dans l'historique
    const newHistorique = new Historique({
      date: new Date(), // Date actuelle de l'action
      heure: new Date().toLocaleTimeString('fr-FR', { hour12: false }), // Heure au format "HH:mm"
      action, // Action décrite sous forme de chaîne de caractères
      id_users: user._id // ID de l'utilisateur qui a effectué l'action
    });

    // Sauvegarder l'historique
    await newHistorique.save();
    console.log(`Action enregistrée dans l'historique : ${action}`);
  } catch (error) {
    console.error("Erreur lors de l'enregistrement de l'historique :", error);
  }
};


// Récupérer tous les historiques
export const getAllHistorique = async (req, res) => {
  try {
    // Récupérer tous les documents d'historique
    const historiques = await Historique.find();
    
    // Retourner les résultats
    return res.status(200).json(historiques);
  } catch (error) {
    console.error('Erreur lors de la récupération des historiques :', error);
    return res.status(500).json({ message: 'Une erreur est survenue lors de la récupération des historiques.' });
  }
};
