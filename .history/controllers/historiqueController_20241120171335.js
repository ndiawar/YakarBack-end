import Historique from '../models/historique.js';
import User from '../models/user.js'; // pour récupérer les informations de l'utilisateur

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
      date: new Date(),
      heure: new Date().toLocaleTimeString('fr-FR', { hour12: false }),
      action,
      id_users: user._id
    });

    // Sauvegarder l'historique
    await newHistorique.save();
    console.log(`Action enregistrée dans l'historique : ${action}`);
  } catch (error) {
    console.error("Erreur lors de l'enregistrement de l'historique :", error);
  }
};
