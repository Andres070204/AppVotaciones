const { DataTypes } = require('sequelize');
const sequelize = require('../config/db'); // Asegúrate de que la ruta es correcta

const Propuesta = sequelize.define('Propuesta', {
  titulo: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  descripcion: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  localidad: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  presupuesto: {
    type: DataTypes.DECIMAL,
    allowNull: false,
  },
  fechaInicio: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  fechaFin: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  ubicacion: {
    type: DataTypes.STRING,
    allowNull: false,
  },
});

module.exports = Propuesta;
