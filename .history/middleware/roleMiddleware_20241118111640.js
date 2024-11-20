  // Middleware pour restreindre l'accès à certaines routes selon les rôles
export const roleMiddleware = (...allowedRoles) => {
  // La fonction prend une liste de rôles autorisés comme arguments
  return (req, res, next) => {
      // Vérifie si l'utilisateur est défini sur la requête (via un autre middleware, comme authMiddleware)
      if (!req.user || !req.user.roles) {
          // Si l'utilisateur ou ses rôles ne sont pas définis, renvoie une erreur 403 (accès interdit)
          return res.status(403).json({ message: 'Accès interdit' });
      }

      // Vérifie si l'utilisateur a au moins un des rôles autorisés
      const hasRole = req.user.roles.some(role => allowedRoles.includes(role));
      if (!hasRole) {
          // Si l'utilisateur n'a pas le rôle requis, renvoie une erreur 403 avec un message spécifique
          return res.status(403).json({ message: 'Accès interdit, rôle insuffisant' });
      }

      // Si tout est valide, passe au middleware ou à la route suivante
      next();
  };
};
