const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require('../config/db'); 

const Voto = sequelize.define('Voto', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  identificacion: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  propuestaId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  tipoVoto: {
    type: DataTypes.ENUM('favor', 'contra'),
    allowNull: false,
  },
});
const Propuesta = require('./Propuesta'); // Importa Propuesta después de definir Voto
Voto.belongsTo(Propuesta, { foreignKey: 'propuestaId' });


module.exports = Voto;
