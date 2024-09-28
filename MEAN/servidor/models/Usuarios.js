const mongoose = require('mongoose');

const UsuarioSchema = new mongoose.Schema({
    nombre: { type: String, required: true },
    apellidos: { type: String, required: true },
    tipoDoc: { type: String, required: true },
    numDoc: { type: String, required: true, unique: true },
    votaciones: [{
        eleccion: { type: mongoose.Schema.Types.ObjectId, ref: 'Eleccion' },
        codigoVerificacion: String,
        codigoExpiracion: Date,
        haVotado: { type: Boolean, default: false }
    }]
});

module.exports = mongoose.model('Usuario', UsuarioSchema);