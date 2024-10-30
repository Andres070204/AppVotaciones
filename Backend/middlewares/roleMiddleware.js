const jwt = require('jsonwebtoken');

function authorizeRole(role) {
  return (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ message: 'Token no proporcionado' });
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      if (decoded.role !== role) {
        return res.status(403).json({ message: 'No tienes permiso para acceder a esta página' });
      }
      req.user = decoded; // Pasar la información del usuario al próximo middleware
      next();
    } catch (error) {
      res.status(403).json({ message: 'Token no válido' });
    }
  };
}

module.exports = authorizeRole;
