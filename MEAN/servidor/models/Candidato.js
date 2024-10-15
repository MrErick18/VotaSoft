const mongoose = require('mongoose');

const CandidatoSchema = mongoose.Schema({
    nombreCompleto: {
        type: String,
        required: true
    },
    perfil: {
        type: String,
        required: true
    },
    propuestas: {
        type: String,
    },
    foto: {
        type: String,
        required: true
    },
    eleccion: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Eleccion',
        required: true
    }
});

module.exports = mongoose.model('Candidato', CandidatoSchema);