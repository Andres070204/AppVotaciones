const express = require('express');
const app = express();
const path = require('path');
const authRoutes = require('./Backend/routes/auth'); // Asegúrate de que esta ruta es correcta
const planeadorRoutes = require('./Backend/routes/planeador');
const ciudadanoRoutes = require('./Backend/routes/ciudadano');
app.use(express.json());

app.use('/planeador', planeadorRoutes);
app.use('/ciudadano', ciudadanoRoutes);

// Sirve los archivos estáticos en la carpeta Frontend
app.use(express.static(path.join(__dirname, 'Frontend')));

// Rutas de autenticación
app.use('/auth', authRoutes);


// Ruta para la raíz del servidor (index.html)
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});

const db = require('./Backend/config/db'); // Ajusta la ruta si es necesario
const User = require('./Backend/models/User'); // Ajusta la ruta si es necesario

db.sync({ force: false }) // Esto mantendrá los datos en la tabla 'users'
  .then(() => {
    
  })
  .catch((error) => {
    console.error('Error al crear la tabla de usuarios:', error);
  });
  app.use((req, res, next) => {
    res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, private");
    next();
  });
  