const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const AdministradorSchema = new Schema({
    nombre: { type: String, required: true },
    apellido: { type: String, required: true },
    tipoDoc: { type: String, required: true },
    numDoc: { type: String, required: true, unique: true },
    correo: { type: String, required: true, unique: true },
    contrasena: { type: String, required: true },
    cargo: { type: String, required: true },
    resetPasswordToken: { type: String },
    resetPasswordExpires: { type: Date },
}, { timestamps: true });

module.exports = mongoose.model('Administrador', AdministradorSchema);
