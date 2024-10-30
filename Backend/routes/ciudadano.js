const express = require('express');
const Propuesta = require('../models/Propuesta');
const router = express.Router();

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

module.exports = router;
