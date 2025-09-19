// Middleware para roles específicos
export function authorizeRoles(...roles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: "Token requerido" });
    }
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: "No tienes permisos para acceder a este recurso" });
    }
    next();
  };
}

export const checkRole = (role) => {
  return (req, res, next) => {
    if (req.user && req.user.role === role) {
      next();
    } else {
      res.status(403).json({ message: "Acceso denegado: permisos insuficientes" });
    }
  };
};
