const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { transporter } = require("../config/mailer");
const Administrador = require("../models/Administrador");

const BCRYPT_ROUNDS = 12;

// Función para generar una clave JWT aleatoria
function generateJWTSecret() {
    return crypto.randomBytes(64).toString('hex');
}

// Generamos la clave JWT al iniciar la aplicación
const JWT_SECRET = generateJWTSecret();
console.log('Nueva clave JWT generada');

exports.crearAdministrador = async (req, res) => {
    try {
        const { numDoc, contrasena } = req.body;
        const existeAdministrador = await Administrador.findOne({ numDoc }).lean();
        if (existeAdministrador) {
            return res.status(400).json({ msg: "El número de documento ya está en uso" });
        }

        const hashedPassword = await bcrypt.hash(contrasena, BCRYPT_ROUNDS);
        const administrador = new Administrador({ ...req.body, contrasena: hashedPassword });
        await administrador.save();
        res.status(201).json(administrador);
    } catch (error) {
        console.error('Error en crearAdministrador:', error);
        res.status(500).json({ error: 'Ocurrió un Error' });
    }
};

exports.obtenerAdministrador = async (req, res) => {
    try {
        const administradores = await Administrador.find().lean();
        res.json(administradores);
    } catch (error) {
        console.error('Error en obtenerAdministrador:', error);
        res.status(500).json({ error: 'Ocurrió un error' });
    }
};

exports.actualizarAdministrador = async (req, res) => {
    try {
        const { id } = req.params;
        const { contrasena, ...updateData } = req.body;

        if (contrasena) {
            updateData.contrasena = await bcrypt.hash(contrasena, BCRYPT_ROUNDS);
        }

        const administrador = await Administrador.findByIdAndUpdate(id, updateData, { new: true, runValidators: true });
        if (!administrador) return res.status(404).json({ msg: "Administrador No Existe" });

        res.json(administrador);
    } catch (error) {
        console.error('Error en actualizarAdministrador:', error);
        res.status(500).json({ error: "Ocurrió un Error al Actualizar" });
    }
};

exports.buscarAdministrador = async (req, res) => {
    try {
        const administrador = await Administrador.findById(req.params.id).lean();
        if (!administrador) return res.status(404).json({ msg: 'Administrador no encontrado' });
        res.json(administrador);
    } catch (error) {
        console.error('Error en buscarAdministrador:', error);
        res.status(500).json({ error: 'Ocurrió un Error' });
    }
};

exports.eliminarAdministrador = async (req, res) => {
    try {
        const resultado = await Administrador.findByIdAndDelete(req.params.id);
        if (!resultado) return res.status(404).json({ msg: "Administrador no encontrado" });
        res.json({ msg: "Administrador eliminado" });
    } catch (error) {
        console.error('Error en eliminarAdministrador:', error);
        res.status(500).json({ error: 'Ocurrió un Error' });
    }
};

exports.loginAdministrador = async (req, res) => {
    try {
        const { numDoc, contrasena } = req.body;
        const administrador = await Administrador.findOne({ numDoc }).select('+contrasena').lean();
        if (!administrador || !(await bcrypt.compare(contrasena, administrador.contrasena))) {
            return res.status(400).json({ msg: "Error en usuario/contraseña" });
        }

        const token = jwt.sign({ administrador_id: administrador._id, numDoc }, JWT_SECRET, { expiresIn: '1h' });
        res.json({ msg: "Login Correcto", token });
    } catch (error) {
        console.error('Error en loginAdministrador:', error);
        res.status(500).json({ error: 'Ocurrió un Error' });
    }
};

exports.verificarNumeroDocumento = async (req, res) => {
    try {
        const exists = await Administrador.exists({ numDoc: req.params.numDoc });
        res.json({ exists: !!exists });
    } catch (error) {
        console.error('Error en verificarNumeroDocumento:', error);
        res.status(500).json({ error: 'Ocurrió un error al verificar el número de documento' });
    }
};

exports.verificarCorreo = async (req, res) => {
    try {
        const { correo } = req.params;
        const administrador = await Administrador.findOne({ correo }).lean();

        if (administrador) {
            const token = jwt.sign({ administrador_id: administrador._id }, JWT_SECRET, { expiresIn: '1h' });
            await Administrador.findByIdAndUpdate(administrador._id, {
                resetPasswordToken: token,
                resetPasswordExpires: Date.now() + 3600000
            });

            await transporter.sendMail({
                from: '"VotaSoft Soporte" <votasoftsoporte@gmail.com>',
                to: correo,
                subject: "Recuperación de Acceso a tu Cuenta",
                html: `
                    <p><strong>Hola,</strong></p>
                    <p>Recibimos una solicitud para recuperar tu acceso a <strong>VotaSoft</strong>. Para restablecer tu contraseña, haz clic en el enlace a continuación:</p>
                    <p><a href="https://votasoft.netlify.app/olvide-contrasena?token=${token}">Restablecer mi contraseña</a></p>
                    <p>Este enlace expirará en 1 hora.</p>
                    <p>Si no solicitaste esta recuperación de contraseña, ignora este mensaje.</p>
                    <p>Saludos,<br>Equipo VotaSoft</p>
                `
            });

            res.status(200).json({ exists: true, message: 'Correo enviado' });
        } else {
            res.status(404).json({ exists: false, message: 'El correo no está registrado en el sistema' });
        }
    } catch (error) {
        console.error('Error en verificarCorreo:', error);
        res.status(500).json({ error: 'Error al verificar el correo' });
    }
};

exports.restablecerContrasena = async (req, res) => {
    try {
        const { token, nuevaContrasena } = req.body;
        const payload = jwt.verify(token, JWT_SECRET);

        const administrador = await Administrador.findById(payload.administrador_id);
        if (!administrador) {
            return res.status(400).json({ message: 'Administrador no encontrado' });
        }

        administrador.contrasena = await bcrypt.hash(nuevaContrasena, BCRYPT_ROUNDS);
        administrador.resetPasswordToken = undefined;
        administrador.resetPasswordExpires = undefined;
        await administrador.save();

        res.status(200).json({ message: 'Contraseña actualizada correctamente' });
    } catch (error) {
        console.error('Error al restablecer la contraseña:', error);
        if (error.name === 'JsonWebTokenError') {
            return res.status(400).json({ message: 'Token inválido o expirado' });
        }
        res.status(500).json({ error: 'Error al restablecer la contraseña' });
    }
};