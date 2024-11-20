const jwt = require('jsonwebtoken');

function authorizeRole(role) {
  return (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ message: 'Token no proporcionado' });
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Agregar la identificación y el rol al request
      req.user = {
        userId: decoded.userId,
        identificacion: decoded.identificacion, 
        role: decoded.role,
      };

      // Verificar el rol
      if (decoded.role !== role) {
        return res.status(403).json({ message: 'No tienes permiso para realizar esta acción.' });
      }

      next();
    } catch (error) {
      console.error('Error al verificar el token:', error);
      res.status(403).json({ message: 'Token no válido o expirado.' });
    }
  };
}


module.exports = authorizeRole;
