const mongoose = require('mongoose');

const VotoSchema = new mongoose.Schema({
  Usuarios_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Usuario' },
  Candidato_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Candidato' },
  Eleccion_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Eleccion' },
  fechaEmision: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Voto', VotoSchema);