const path = require('path');
const express = require('express');
const conectarDB = require('./config/db');
const cors = require('cors');

const app = express();

// Conectar a la base de datos
conectarDB();

// Configuración de CORS
const corsOptions = {
  origin: ['https://votasoft-web.onrender.com', 'https://votasoft.onrender.com', 'http://localhost:4200'],
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
  optionsSuccessStatus: 204
};

app.use(cors(corsOptions));

// Configuración para servir archivos estáticos
app.use(express.static(path.join(__dirname, 'client', 'dist')));

// Enviar el archivo index.html para cualquier ruta no reconocida
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'client', 'dist', 'index.html'));
});

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
