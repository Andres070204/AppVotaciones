const bcrypt = require('bcrypt');
const express = require('express');
const Propuesta = require('../models/Propuesta');
const router = express.Router();
const authorizeRole = require('../middlewares/roleMiddleware');
const Voto = require('../models/Voto'); 
const User = require('../models/User');


// Ruta para obtener todas las propuestas
router.get('/propuestas', async (req, res) => {
  try {
    const propuestas = await Propuesta.findAll();
    res.status(200).json(propuestas);
  } catch (error) {
    console.error('Error al obtener propuestas:', error);
    res.status(500).json({ message: 'Error al obtener propuestas' });
  }
});
router.get('/propuestas/:id', async (req, res) => {
  try {
    const id = req.params.id; // Asegúrate de que esta línea esté presente
    console.log('Se recibió una solicitud para la propuesta con ID:', id);
    const propuesta = await Propuesta.findByPk(id);

    if (!propuesta) {
      return res.status(404).json({ message: 'Propuesta no encontrada' });
    }

    res.status(200).json(propuesta);
  } catch (error) {
    console.error('Error al obtener la propuesta:', error);
    res.status(500).json({ message: 'Error al obtener la propuesta', error: error.message });
  }
});

// Ruta para votar a favor

router.post('/propuestas/:id/votar/favor', authorizeRole('ciudadano'), async (req, res) => {
  try {
    const identificacion = req.user.identificacion; // Obtenida del token decodificado

    // Verificar si el usuario ya ha votado en cualquier propuesta
    const votoExistente = await Voto.findOne({
      where: { identificacion },
    });

    if (votoExistente) {
      return res.status(400).json({ message: 'Ya has votado en una propuesta. No puedes votar en otra.' });
    }

    const propuestaId = req.params.id;

    // Registrar el nuevo voto
    const nuevoVoto = await Voto.create({ identificacion, propuestaId, tipoVoto: 'favor' });

    res.status(201).json({ message: 'Voto registrado correctamente.', voto: nuevoVoto });
  } catch (error) {
    console.error('Error al registrar el voto a favor:', error);
    res.status(500).json({ message: 'Error al registrar el voto a favor.' });
  }
});





// Ruta para votar en contra
router.post('/propuestas/:id/votar/contra', authorizeRole('ciudadano'), async (req, res) => {
  try {
    const identificacion = req.user.identificacion; // Obtenida del token decodificado

    // Verificar si el usuario ya ha votado en cualquier propuesta
    const votoExistente = await Voto.findOne({
      where: { identificacion },
    });

    if (votoExistente) {
      return res.status(400).json({ message: 'Ya has votado en una propuesta. No puedes votar en otra.' });
    }

    const propuestaId = req.params.id;

    // Registrar el nuevo voto
    const nuevoVoto = await Voto.create({ identificacion, propuestaId, tipoVoto: 'contra' });

    res.status(201).json({ message: 'Voto registrado correctamente.', voto: nuevoVoto });
  } catch (error) {
    console.error('Error al registrar el voto en contra:', error);
    res.status(500).json({ message: 'Error al registrar el voto en contra.' });
  }
});



router.get('/propuestas/:id/voto/:userId', async (req, res) => {
  try {
    const { id, userId } = req.params;

    const votoExistente = await Voto.findOne({ 
      where: { 
        propuestaId: id, 
        userIdentificacion: userId 
      } 
    });

    if (votoExistente) {
      return res.status(200).json(true);
    } else {
      return res.status(200).json(false);
    }
  } catch (error) {
    console.error('Error al verificar el voto existente:', error);
    return res.status(500).json({ message: 'Error al verificar el voto existente.' });
  }
});

router.put('/editar-perfil', authorizeRole('ciudadano'), async (req, res) => {
  try {
    const { email, currentPassword, newPassword } = req.body;
    const identificacion = req.user.identificacion;

    // Buscar usuario
    const usuario = await User.findOne({ where: { identificacion } });
    if (!usuario) {
      return res.status(404).json({ message: 'Usuario no encontrado.' });
    }

    // Verificar contraseña actual
    const isPasswordValid = await bcrypt.compare(currentPassword, usuario.password);
    if (!isPasswordValid) {
      return res.status(400).json({ message: 'Contraseña actual incorrecta.' });
    }
    

    // Actualizar correo y/o contraseña
    if (email) usuario.email = email;
    if (newPassword) {
      const salt = await bcrypt.genSalt(10);
      usuario.password = await bcrypt.hash(newPassword, salt);
    }

    await usuario.save();
    res.status(200).json({ message: 'Perfil actualizado correctamente.' });
  } catch (error) {
    console.error('Error en el backend:', error);
    res.status(500).json({ message: 'Error interno del servidor.' });
  }
});

module.exports = router;