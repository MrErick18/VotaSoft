const mongoose = require('mongoose');

const AdministradorSchema = mongoose.Schema({
    nombre: {
        type: String,
        require: true
    },
    apellido: {
        type: String,
        require: true
    },
    tipoDoc: {
        type: String,
        require: true
    },
    numDoc: {
        type: String,
        require: true,
        unique: true
    },
    correo: {
        type: String,
        require: true,
        unique: true
    },
    contrasena: {
        type: String,
        require: true
    },
    cargo: {
        type: String,
        require: true
    },
    resetPasswordToken: String,
    resetPasswordExpires: Date
});

module.exports = mongoose.model('Administrador', AdministradorSchema);
