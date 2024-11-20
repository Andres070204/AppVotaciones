const { Sequelize, DataTypes } = require('sequelize');
const db = require('../config/db');

const User = db.define('User', {
  nombres: DataTypes.STRING,
  apellidos: DataTypes.STRING,
  identificacion: {
    type: DataTypes.STRING,
    unique: true
  },
  email: {
    type: DataTypes.STRING,
    unique: true
  },
  password: DataTypes.STRING,
  fechaNacimiento: DataTypes.DATE,
  telefono: DataTypes.STRING,
  genero: DataTypes.STRING,
  rol: DataTypes.STRING,
  verified: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  resetToken: {
    type: DataTypes.STRING, // Token de restablecimiento de contraseña
    allowNull: true
  },
  resetTokenExpiry: {
    type: DataTypes.DATE, // Fecha y hora de expiración del token
    allowNull: true
  }
  
});


// Función para encontrar un usuario por email
User.findByEmail = async function (email, callback) {
  try {
    const user = await User.findOne({ where: { email } });
    callback(null, user);
  } catch (err) {
    callback(err, null);
  }
};

// Función para registrar un nuevo usuario
User.register = async function (newUser, callback) {
  try {
    await User.create(newUser);
    callback(null);
  } catch (err) {
    callback(err);
  }
};

module.exports = User;
