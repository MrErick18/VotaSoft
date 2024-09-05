const express = require('express');
const conectarDB = require('./config/db');
const cors = require('cors');
const cron = require('node-cron'); // Importar node-cron
const app = express();

conectarDB();
app.use(cors());

// Configurar express.json para manejar cuerpos de solicitud grandes
app.use(express.json({ limit: '100mb' }));
app.use(express.urlencoded({ limit: '100mb', extended: true }));

app.use('/api/administrador', require('./routes/administrador'))
app.use('/api/candidato', require('./routes/candidato'))
app.use('/api/eleccion', require('./routes/eleccion'))
app.use('/api/resultados', require('./routes/resultados'))
app.use('/api/usuarios', require('./routes/usuario'))
app.use('/api/voto', require('./routes/voto'))

// Configura la tarea cron para actualizar el estado de las elecciones
cron.schedule('0 0 * * *', async () => {
  try {
    console.log('Ejecutando tarea cron para actualizar el estado de las elecciones...');
    await updateEleccionesEstado();
    console.log('Estado de las elecciones actualizado exitosamente.');
  } catch (error) {
    console.error('Error al actualizar el estado de las elecciones:', error);
  }
});

app.listen(4000, () => {
    console.log('Servidor funcionando en el puerto 4000');
});
