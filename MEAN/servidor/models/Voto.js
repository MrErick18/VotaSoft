const mongoose = require('mongoose');

const VotosSchema = mongoose.Schema({
    Usuarios_id:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Usuarios',
        required: true
    },
    Candidato_id:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Candidato',
        required: true
    },
    Eleccion_id:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Eleccion',
        required: true
    },
    fechaEmision:{
        type: Date,
        default: Date.now(),
        required: true
    }
})