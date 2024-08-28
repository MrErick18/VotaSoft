const express = require('express');
const conectarDB = require('./config/db');
const cors = require('cors');

const app = express();

conectarDB();
app.use(cors());

app.use(express.json());
app.use('/api/administrador', require('./routes/administrador'))
app.use('/api/candidato', require('./routes/candidato'))
app.use('/api/eleccion', require('./routes/eleccion'))
app.use('/api/resultados', require('./routes/resultados'))
app.use('/api/usuarios', require('./routes/usuario'))
app.use('/api/voto', require('./routes/voto'))



app.listen(4000, () => {
    console.log('Servidor funcionando en el puerto 4000');
})