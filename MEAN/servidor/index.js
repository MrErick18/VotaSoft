const path = require('path');
const express = require('express');
const conectarDB = require('./config/db');
const cors = require('cors');
const dotenv = require('dotenv');
const cron = require('node-cron');
const { updateEleccionesEstado } = require('./services/eleccionService');

dotenv.config();

const app = express();

// Conectar a la base de datos
conectarDB();

// Configuración de CORS
const corsOptions = {
  origin: ['https://votasoft.netlify.app', 'http://localhost:4200'],
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
  optionsSuccessStatus: 204
};

app.use(cors(corsOptions));

// Configuración del middleware
app.use(express.json({ limit: '100mb' }));
app.use(express.urlencoded({ limit: '100mb', extended: true }));


// Rutas
app.use('/api/administrador', require('./routes/administrador'));
app.use('/api/candidato', require('./routes/candidato'));
app.use('/api/eleccion', require('./routes/eleccion'));
app.use('/api/resultados', require('./routes/resultados'));
app.use('/api/usuarios', require('./routes/usuario'));
app.use('/api/voto', require('./routes/voto'));

const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
  console.log(`Servidor funcionando en el puerto ${PORT}`);
});

cron.schedule('0 * * * *', async () => {
  try {
    console.log('Actualizando el estado de las elecciones...');
    await updateEleccionesEstado();
    console.log('Actualización de estado de elecciones completada.');
  } catch (error) {
    console.error('Error actualizando el estado de las elecciones:', error);
  }
});
