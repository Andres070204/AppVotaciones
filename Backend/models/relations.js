const Propuesta = require('./Propuesta');
const Voto = require('./Voto');

// Define las relaciones
Propuesta.hasMany(Voto, { foreignKey: 'propuestaId' });
Voto.belongsTo(Propuesta, { foreignKey: 'propuestaId' });

module.exports = { Propuesta, Voto };
