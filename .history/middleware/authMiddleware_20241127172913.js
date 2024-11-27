// Importation du module jsonwebtoken pour manipuler les JWT
import jwt from 'jsonwebtoken';
// Importation du modèle utilisateur pour accéder à la base de données
import User from '../models/user.js'; // Chemin relatif à vérifier

// Middleware pour vérifier le token JWT et authentifier l'utilisateur
export const authMiddleware = async (req, res, next) => {
    const token = req.cookies.AUTH_COOKIE;
    if (!token) {
      return res.status(401).json({ message: 'Veuillez vous connecter d\'abord.' });
    }
  
    try {
      const decoded = jwt.verify(token, process.env.APP_SECRET);
      const user = await User.findById(decoded.id);
      if (!user) {
        return res.status(401).json({ message: 'Utilisateur non trouvé.' });
      }
      req.user = user;
      next();
    } catch (err) {
      return res.status(401).json({ message: 'Token invalide ou expiré.' });
    }
  };
  
