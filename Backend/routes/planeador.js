const bcrypt = require('bcrypt');
const express = require('express');
const Propuesta = require('../models/Propuesta');
const User = require('../models/User');
const authorizeRole = require('../middlewares/roleMiddleware');
const router = express.Router();

// Crear propuesta
router.post('/agregar-propuesta', async (req, res) => {
  try {
    const { titulo, descripcion, localidad, presupuesto, fechaInicio, fechaFin, ubicacion } = req.body;
    const nuevaPropuesta = await Propuesta.create({
      titulo,
      descripcion,
      localidad,
      presupuesto,
      fechaInicio,
      fechaFin,
      ubicacion,
    });
    res.status(201).json({ message: 'Propuesta creada exitosamente', propuesta: nuevaPropuesta });
  } catch (error) {
    console.error('Error al crear la propuesta:', error);
    res.status(500).json({ message: 'Error al crear la propuesta' });
  }
});
// Obtener una propuesta específica por ID
router.get('/propuestas/:id', async (req, res) => {
    try {
      const propuesta = await Propuesta.findByPk(req.params.id);
      if (propuesta) {
        res.json(propuesta);
      } else {
        res.status(404).json({ message: 'Propuesta no encontrada' });
      }
    } catch (error) {
      console.error('Error al obtener la propuesta:', error);
      res.status(500).json({ message: 'Error al obtener la propuesta' });
    }
  });
// Actualizar propuesta
router.put('/actualizar-propuesta/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { titulo, descripcion, localidad, presupuesto, fechaInicio, fechaFin, ubicacion } = req.body;

    const propuesta = await Propuesta.findByPk(id);
    if (!propuesta) {
      return res.status(404).json({ message: 'Propuesta no encontrada' });
    }

    await propuesta.update({
      titulo,
      descripcion,
      localidad,
      presupuesto,
      fechaInicio,
      fechaFin,
      ubicacion,
    });

    res.json({ message: 'Propuesta actualizada exitosamente', propuesta });
  } catch (error) {
    console.error('Error al actualizar la propuesta:', error);
    res.status(500).json({ message: 'Error al actualizar la propuesta' });
  }
});

// Eliminar propuesta
router.delete('/eliminar-propuesta/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const propuesta = await Propuesta.findByPk(id);

    if (!propuesta) {
      return res.status(404).json({ message: 'Propuesta no encontrada' });
    }

    await propuesta.destroy();
    res.json({ message: 'Propuesta eliminada exitosamente' });
  } catch (error) {
    console.error('Error al eliminar la propuesta:', error);
    res.status(500).json({ message: 'Error al eliminar la propuesta' });
  }
});

// Obtener todas las propuestas (para listar en el frontend)
router.get('/propuestas', async (req, res) => {
  try {
    const propuestas = await Propuesta.findAll();
    res.json(propuestas);
  } catch (error) {
    console.error('Error al obtener las propuestas:', error);
    res.status(500).json({ message: 'Error al obtener las propuestas' });
  }
});
router.put('/editar-perfil', authorizeRole('planeador'), async (req, res) => {
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
