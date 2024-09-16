const express = require('express');
const conectarDB = require('./config/db');
const cors = require('cors');
const cron = require('node-cron'); // Importar node-cron
const { updateEleccionesEstado } = require('./services/eleccionService'); // Importar la función del servicio

const app = express();

conectarDB();
app.use(cors());

// Configurar express.json para manejar cuerpos de solicitud grandes
app.use(express.json({ limit: '100mb' }));
app.use(express.urlencoded({ limit: '100mb', extended: true }));

app.use('/api/administrador', require('./routes/administrador'));
app.use('/api/candidato', require('./routes/candidato'));
app.use('/api/eleccion', require('./routes/eleccion'));
app.use('/api/resultados', require('./routes/resultados'));
app.use('/api/usuarios', require('./routes/usuario'));
app.use('/api/voto', require('./routes/voto'));

// Configurar el cron job para actualizar el estado de las elecciones
cron.schedule('0 * * * *', async () => {
  try {
    console.log('Ejecutando cron job para actualizar el estado de las elecciones...');
    await updateEleccionesEstado();
    console.log('Estado de las elecciones actualizado con éxito.');
  } catch (error) {
    console.error('Error al actualizar el estado de las elecciones:', error);
  }
});

// Utiliza el puerto proporcionado por Render o por defecto el 4000 si no está definido
const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
  console.log(`Servidor funcionando en el puerto ${PORT}`);
});
