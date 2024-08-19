const mongoose = require('mongoose');

const ResultadosSchema = mongoose.Schema({
    votosTotales:{
        type: Number,
        required: true
    },
    Eleccion_id:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Eleccion',
        required: true
    },
    Candidato_id:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Candidato',
        required: true
    }
})

module.exports = mongoose.model('Resultados', ResultadosSchema);