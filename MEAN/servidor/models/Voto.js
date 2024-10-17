const mongoose = require('mongoose');

const VotoSchema = mongoose.Schema({
    Usuarios_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Usuario',
        required: true
    },
    Candidato_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Candidato',
        required: function() { return !this.esVotoEnBlanco; }
    },
    Eleccion_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Eleccion',
        required: true
    },
    esVotoEnBlanco: {
        type: Boolean,
        default: false
    },
    fechaEmision: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Voto', VotoSchema);