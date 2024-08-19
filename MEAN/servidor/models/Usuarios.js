const mongoose = require('mongoose');

const UsuariosSchema = mongoose.Schema({
    nombre:{
        type: String,
        required: true
    },
    apellidos:{
        type: String,
        required: true
    },
    tipoDoc:{
        type: String,
        required: true
    },
    numDoc:{
        type: String,
        required: true
    }
})

module.exports = mongoose.model('Usuarios', UsuariosSchema);