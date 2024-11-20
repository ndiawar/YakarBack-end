export const roleMiddleware = (...allowedRoles) => {
    return (req, res, next) => {
      if (!req.user || !req.user.roles) {
        return res.status(403).json({ message: 'Accès interdit' });
      }
  
      // Vérifier si l'utilisateur a l'un des rôles permis
      const hasRole = req.user.roles.some(role => allowedRoles.includes(role));
      if (!hasRole) {
        return res.status(403).json({ message: 'Accès interdit, rôle insuffisant' });
      }
  
      next();
    };
  };
  