const mongoose = require('mongoose');

const EleccionSchema = mongoose.Schema({
    nombre:{
        type: String,
        required: true
    },
    tipo:{
        type: String,
        required: true
    },
    fecha:{
        type: Date,
        required: true
    },
    estado:{
        type: String,
        required: true
    }
})

module.exports = mongoose.model('Eleccion', EleccionSchema);