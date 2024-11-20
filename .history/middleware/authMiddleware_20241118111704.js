// Importation du module jsonwebtoken pour manipuler les JWT
import jwt from 'jsonwebtoken';
// Importation du modèle utilisateur pour accéder à la base de données
import User from '../models/user.js'; // Chemin relatif à vérifier

// Middleware pour vérifier le token JWT et authentifier l'utilisateur
export const authMiddleware = async (req, res, next) => {
    // Récupère le JWT depuis les cookies de la requête
    const token = req.cookies.AUTH_COOKIE;

    // Vérifie si le token est présent dans les cookies
    if (!token) {
        // Si le token est absent, renvoie une erreur 401 (non autorisé)
        return res.status(401).json({ message: 'Veuillez vous connecter d\'abord.' });
    }

    try {
        // Tente de décoder et de vérifier le token en utilisant la clé secrète
        const decoded = jwt.verify(token, process.env.APP_SECRET);

        // Récupère l'utilisateur associé à l'ID contenu dans le token
        const user = await User.findById(decoded.id);

        // Si aucun utilisateur n'est trouvé, renvoie une erreur 401
        if (!user) {
            return res.status(401).json({ message: 'Utilisateur non trouvé.' });
        }

        // Associe les informations de l'utilisateur à l'objet req pour les middlewares suivants
        req.user = user;

        // Si tout est valide, passe au middleware ou à la route suivante
        next();
    } catch (err) {
        // Si le token est invalide ou expiré, renvoie une erreur 401
        return res.status(401).json({ message: 'Token invalide ou expiré.' });
    }
};
