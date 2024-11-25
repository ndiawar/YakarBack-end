import User from './models/User'; // Assurez-vous d'importer le modèle User
import Historique from './models/Historique'; // Assurez-vous d'importer le modèle Historique

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

// Fonction pour récupérer les historiques avec les noms des utilisateurs
// export const getAllHistorique = async (req, res) => {
//   try {
//     const historiques = await Historique.find().lean(); // Récupère les logs avec les IDs des utilisateurs

//     // Parcourez les logs pour ajouter le nom des utilisateurs
//     const historiquesWithUserNames = await Promise.all(historiques.map(async (historique) => {
//       if (historique.id_user) {
//         const user = await User.findById(historique.id_user); // Cherche l'utilisateur par ID
//         return {
//           ...historique,
//           userName: user ? user.name : 'Utilisateur inconnu', // Ajoute le nom de l'utilisateur
//         };
//       }
//       return { ...historique, userName: 'Utilisateur inconnu' }; // Cas où id_user est null ou non valide
//     }));

//     res.status(200).json(historiquesWithUserNames);
//   } catch (error) {
//     console.error('Erreur lors de la récupération des historiques :', error);
//     res.status(500).json({ message: 'Erreur serveur lors de la récupération des historiques.' });
//   }
// };
export const getAllHistorique = async (req, res) => {
  try {
    const historiques = await Historique.find()
      .populate('id_user', 'name') // Inclut uniquement le champ "name" de l'utilisateur
      .lean(); // Convertit en objet JavaScript classique pour une manipulation plus simple

    res.status(200).json(historiques.map((histo) => ({
      ...histo,
      userName: histo.id_user ? histo.id_user.name : 'Utilisateur inconnu',
    })));
  } catch (error) {
    console.error('Erreur lors de la récupération des historiques :', error);
    res.status(500).json({ message: 'Erreur serveur lors de la récupération des historiques.' });
  }
};





// Récupérer les historiques entre deux dates
export const getHistoriqueByDateRange = async (req, res) => {
  const { startDate, endDate } = req.query;

  try {
    // Vérifier que les deux dates sont fournies
    if (!startDate || !endDate) {
      return res.status(400).json({ message: 'Les dates de début et de fin sont requises.' });
    }

    // Convertir les dates au format Date
    const start = new Date(startDate);
    const end = new Date(endDate);

    // Filtrer les historiques entre les deux dates
    const historiques = await Historique.find({
      date: { $gte: start, $lte: end },
    }).sort({ date: -1 }); // Trier par date décroissante

    if (historiques.length === 0) {
      return res.status(404).json({ message: 'Aucun historique trouvé pour cette période.' });
    }

    return res.status(200).json(historiques);
  } catch (error) {
    console.error('Erreur lors de la récupération des historiques par période :', error);
    return res.status(500).json({ message: 'Une erreur est survenue lors de la récupération des historiques.' });
  }
};


// Récupérer les historiques d'une action spécifique
export const getHistoriqueByAction = async (req, res) => {
  const { action } = req.query; // Action à filtrer, récupérée depuis la requête

  try {
    // Rechercher les historiques où l'action correspond à la valeur donnée
    const historiques = await Historique.find({ action: { $regex: action, $options: 'i' } })
      .sort({ date: -1 }); // Trier par date décroissante

    if (historiques.length === 0) {
      return res.status(404).json({ message: 'Aucun historique trouvé pour cette action.' });
    }

    return res.status(200).json(historiques);
  } catch (error) {
    console.error('Erreur lors de la récupération des historiques par action :', error);
    return res.status(500).json({ message: 'Une erreur est survenue lors de la récupération des historiques.' });
  }
};


// Récupérer l'historique d'un utilisateur spécifique
export const getHistoriqueByUser = async (req, res) => {
  const { userId } = req.params; // Récupérer l'ID utilisateur depuis les paramètres de la requête

  try {
    // Vérifier si l'utilisateur existe dans la base de données
    const userHistorique = await Historique.find({ id_users: userId })
      .sort({ date: -1 }); // Trier par date décroissante

    if (!userHistorique) {
      return res.status(404).json({ message: 'Aucun historique trouvé pour cet utilisateur.' });
    }

    return res.status(200).json(userHistorique);
  } catch (error) {
    console.error('Erreur lors de la récupération de l\'historique de l\'utilisateur :', error);
    return res.status(500).json({ message: 'Une erreur est survenue lors de la récupération de l\'historique de l\'utilisateur.' });
  }
};
