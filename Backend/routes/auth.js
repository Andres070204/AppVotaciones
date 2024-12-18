const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { sendVerificationEmail, sendPasswordResetEmail } = require('../config/emailService');
const authorizeRole = require('../middlewares/roleMiddleware'); // Middleware para roles
const path = require('path');
const router = express.Router();
const authenticateToken = require('../middlewares/authenticateToken');
const { Op } = require('sequelize');



router.get('/ciudadano/dashboard', authenticateToken, authorizeRole('ciudadano'), (req, res) => {
  res.redirect('/html/roles/ciudadano.html');
});
// Ruta de dashboard para Ciudadanos
router.get('/ciudadano/dashboard', authorizeRole('ciudadano'), (req, res) => {
  res.redirect('/html/roles/ciudadano.html');
});

// Ruta de dashboard para Decisores
router.get('/decisor/dashboard', authorizeRole('decisor'), (req, res) => {
  res.redirect('/html/roles/decisor.html');
});

// Ruta de dashboard para Planeadores
router.get('/planeador/dashboard', authorizeRole('planeador'), (req, res) => {
  res.redirect('/html/roles/planeador.html');
});


// Ruta para registrar usuario
router.post('/register', async (req, res) => {
  try {
    const { nombres, apellidos, identificacion, email, password, fechaNacimiento, telefono, genero, rol } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      nombres,
      apellidos,
      identificacion,
      email,
      password: hashedPassword,
      fechaNacimiento,
      telefono,
      genero,
      rol,
      verified: false
    });

    const token = jwt.sign({ email: user.email }, process.env.JWT_SECRET, { expiresIn: '1h' });
    const verificationLink = `http://localhost:3000/auth/verify-email?token=${token}`;
    
    await sendVerificationEmail(user.email, verificationLink);

    res.status(200).json({ message: 'Registro exitoso. Por favor, revisa tu correo electrónico para verificar tu cuenta.' });
  } catch (error) {
    console.error('Error al registrar usuario:', error);
    res.status(500).json({ message: 'Error al registrar el usuario' });
  }
});

// Ruta para el inicio de sesión
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ where: { email } });

    if (!user) {
      return res.status(400).json({ message: 'Usuario no encontrado' });
    }
    if (!user.verified) {
      return res.status(400).json({ message: 'Verifica tu correo electrónico para iniciar sesión' });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(400).json({ message: 'Contraseña incorrecta' });
    }
    const token = jwt.sign({ userId: user.id, identificacion: user.identificacion, role: user.rol }, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.json({ message: 'Inicio de sesión exitoso', token, role: user.rol });
    
  } catch (error) {
    console.error('Error al iniciar sesión:', error);
    res.status(500).json({ message: 'Error en el servidor al iniciar sesión' });
  }
});


// Ruta para verificar el correo electrónico
router.get('/verify-email', async (req, res) => {
  try {
    const token = req.query.token;
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    await User.update({ verified: true }, { where: { email: decoded.email } });
    res.send('Correo verificado con éxito. Ahora puedes iniciar sesión.');
  } catch (error) {
    console.error('Error en la verificación de correo:', error);
    res.status(400).send('Enlace de verificación no válido o expirado.');
  }
});

// Ruta para verificar la validez del token
router.get('/verify-token', (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'Token no proporcionado' });

  try {
    jwt.verify(token, process.env.JWT_SECRET);
    res.status(200).json({ message: 'Token válido' });
  } catch (error) {
    res.status(403).json({ message: 'Token inválido o expirado' });
  }
});
// Ruta para solicitar restablecimiento de contraseña
router.post('/reset-password', async (req, res) => {
  const { email } = req.body;
  console.log('Correo recibido:', email); // Verifica si el correo llega

  try {
    const user = await User.findOne({ where: { email } });
    if (!user) {
      console.log('Usuario no encontrado'); // Verifica si el usuario existe
      return res.status(404).json({ message: 'Usuario no encontrado.' });
    }

    const resetToken = Math.random().toString(36).substr(2); // Generar token
    console.log('Token generado:', resetToken);

    user.resetToken = resetToken;
    user.resetTokenExpiry = new Date(Date.now() + 3600000); // 1 hora
    await user.save();

    console.log('Token y fecha guardados en la base de datos');

    await sendPasswordResetEmail(email, resetToken);


    console.log('Correo de restablecimiento enviado');

    res.status(200).json({ message: 'Se ha enviado un enlace para restablecer tu contraseña a tu correo.' });
  } catch (error) {
    console.error('Error al procesar la solicitud de restablecimiento:', error);
    res.status(500).json({ message: 'Error interno del servidor.' });
  }
});

// Ruta para actualizar la contraseña con el token
router.post('/update-password', async (req, res) => {
  const { token, newPassword } = req.body;

  try {
    const user = await User.findOne({
      where: {
        resetToken: token,
        resetTokenExpiry: { [Op.gt]: new Date() }, // Verifica que la fecha de expiración no haya pasado
      },
    });
    

    if (!user) {
      return res.status(400).json({ message: 'Token inválido o expirado.' });
    }

    // Hashea la nueva contraseña
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);

    // Limpia el token y la fecha de expiración
    user.resetToken = null;
    user.resetTokenExpiry = null;

    await user.save();

    res.status(200).json({ message: 'Contraseña actualizada exitosamente.' });
  } catch (error) {
    console.error('Error al actualizar la contraseña:', error);
    res.status(500).json({ message: 'Error interno del servidor.' });
  }
});


module.exports = router;


