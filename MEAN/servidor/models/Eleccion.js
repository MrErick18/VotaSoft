const mongoose = require('mongoose');

const EleccionSchema = new mongoose.Schema({
    nombre: { type: String, required: true },
    tipo: { type: String, required: true },
    fecha: { type: Date, required: true },
    estado: { type: String, required: true, enum: ['Pendiente', 'En curso', 'Finalizada'] }
});

module.exports = mongoose.model('Eleccion', EleccionSchema);