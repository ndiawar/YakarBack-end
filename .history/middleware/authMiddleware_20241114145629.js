import jwt from 'jsonwebtoken';
import User from '../models/user.js'; // Assure-toi que le chemin est correct

// Middleware pour vérifier le JWT dans les cookies
export const authMiddleware = async (req, res, next) => {
  const token = req.cookies.AUTH_COOKIE;

  if (!token) {
    return res.status(401).json({ message: 'Veuillez vous connecter d\'abord.' });
  }

  try {
    // Décoder le token et récupérer l'ID de l'utilisateur et ses rôles
    const decoded = jwt.verify(token, process.env.APP_SECRET);
    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(401).json({ message: 'Utilisateur non trouvé.' });
    }

    req.user = user; // Attacher l'utilisateur à la requête
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Token invalide ou expiré.' });
  }
};
