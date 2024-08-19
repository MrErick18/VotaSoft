const mongoose = require('mongoose');

const CandidatoSchema = mongoose.Schema({
    nombreCompleto:{
        type: String,
        required: true
    },
    perfil:{
        type: String,
        required: true
    },
    propuestas:{
        type: String,
        required: true
    },
    foto:{
        type: String,
        required: true
    }
})

module.exports = mongoose.model('Candidato', CandidatoSchema);