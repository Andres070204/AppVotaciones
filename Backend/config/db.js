require('dotenv').config();
const { Sequelize } = require('sequelize');

// Configuración de Sequelize usando variables de entorno
const sequelize = new Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASSWORD, {
  host: process.env.DB_HOST,
  dialect: 'mysql',
  port: process.env.DB_PORT
});

// Autenticar la conexión para verificar que funcione
sequelize.authenticate()
  .then(() => console.log('Conectado a la base de datos MySQL.'))
  .catch(err => console.error('Error al conectar a la base de datos:', err));
  

  
module.exports = sequelize;
