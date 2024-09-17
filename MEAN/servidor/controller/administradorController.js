const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { transporter } = require("../config/mailer");
const Administrador = require("../models/Administrador");

// Crear Administrador
exports.crearAdministrador = async (req, res) => {
    try {
        const { numDoc, contrasena } = req.body;
        const existeAdministrador = await Administrador.findOne({ numDoc });
        if (existeAdministrador) {
            return res.status(400).json({ msg: "El número de documento ya está en uso" });
        }

        req.body.contrasena = bcrypt.hashSync(contrasena, 12);
        const administrador = new Administrador(req.body);
        await administrador.save();
        res.status(201).json(administrador);
    } catch (error) {
        console.log(error);
        res.status(500).send('Ocurrió un Error');
    }
};

// Obtener todos los Administradores
exports.obtenerAdministrador = async (req, res) => {
    try {
        const administradores = await Administrador.find();
        res.json(administradores);
    } catch (error) {
        console.log(error);
        res.status(500).send('Ocurrió un error');
    }
};

// Actualizar Administrador
exports.actualizarAdministrador = async (req, res) => {
    try {
        const { nombre, apellido, tipoDoc, numDoc, correo, contrasena, cargo } = req.body;
        let administrador = await Administrador.findById(req.params.id);
        if (!administrador) return res.status(400).json({ msg: "Administrador No Existe" });

        administrador.nombre = nombre;
        administrador.apellido = apellido;
        administrador.tipoDoc = tipoDoc;
        administrador.numDoc = numDoc;
        administrador.correo = correo;
        if (contrasena) {
            administrador.contrasena = bcrypt.hashSync(contrasena, 12);
        }
        administrador.cargo = cargo;
        administrador = await Administrador.findByIdAndUpdate(req.params.id, administrador, { new: true });
        res.json(administrador);
    } catch (error) {
        console.log(error);
        res.status(500).send("Ocurrió un Error al Actualizar");
    }
};

// Buscar Administrador por ID
exports.buscarAdministrador = async (req, res) => {
    try {
        const administrador = await Administrador.findById(req.params.id);
        if (!administrador) return res.status(404).json({ msg: 'Administrador no encontrado' });
        res.json(administrador);
    } catch (error) {
        console.log(error);
        res.status(500).send('Ocurrió un Error');
    }
};

// Eliminar Administrador
exports.eliminarAdministrador = async (req, res) => {
    try {
        const administrador = await Administrador.findById(req.params.id);
        if (!administrador) return res.status(404).json({ msg: "Administrador no encontrado" });
        await Administrador.findByIdAndDelete(req.params.id);
        res.json({ msg: "Administrador eliminado" });
    } catch (error) {
        console.log(error);
        res.status(500).send('Ocurrió un Error');
    }
};

// Login Administrador
exports.loginAdministrador = async (req, res) => {
    try {
        const { numDoc, contrasena } = req.body;
        const administrador = await Administrador.findOne({ numDoc });
        if (!administrador) return res.status(400).json({ msg: "Error en usuario/contraseña" });

        const esValido = bcrypt.compareSync(contrasena, administrador.contrasena);
        if (!esValido) return res.status(400).json({ msg: "Error en usuario/contraseña" });

        const token = createToken(administrador);
        res.json({ msg: "Login Correcto", token });
    } catch (error) {
        console.log(error);
        res.status(500).send('Ocurrió un Error');
    }
};

// Crear Token JWT
function createToken(administrador) {
    const payload = {
        administrador_id: administrador._id,
        numDoc: administrador.numDoc
    };
    return jwt.sign(payload, "tu_clave_secreta", { expiresIn: '1h' });
}

// Verificar Número de Documento
exports.verificarNumeroDocumento = async (req, res) => {
    try {
        const numDoc = req.params.numDoc;
        const administrador = await Administrador.findOne({ numDoc });
        res.json({ exists: !!administrador }); // Devuelve true si existe, false si no
    } catch (error) {
        console.error(error);
        res.status(500).send('Ocurrió un error al verificar el número de documento');
    }
};

// Verificar Correo y Enviar Correo de Recuperación
exports.verificarCorreo = async (req, res) => {
    try {
        const { correo } = req.params;
        const administrador = await Administrador.findOne({ correo });

        if (administrador) {
            const token = jwt.sign(
                { administrador_id: administrador._id },
                "tu_clave_secreta",
                { expiresIn: '1h' }
            );

            administrador.resetPasswordToken = token;
            administrador.resetPasswordExpires = Date.now() + 3600000; // 1 hora
            await administrador.save();

            await transporter.sendMail({
                from: '"VotaSoft Soporte" <votasoftsoporte@gmail.com>',
                to: correo,
                subject: "Recuperación de Acceso a tu Cuenta",
                html: `
                    <p><strong>Hola,</strong></p>
                    <p>Recibimos una solicitud para recuperar tu acceso a <strong>VotaSoft</strong>. Para restablecer tu contraseña, haz clic en el enlace a continuación:</p>
                    <p><a href="https://votasoft.vercel.app/olvide-contrasena?token=${token}">Restablecer mi contraseña</a></p>
                    <p>Este enlace expirará en 1 hora.</p>
                    <p>Si no solicitaste esta recuperación de contraseña, ignora este mensaje.</p>
                    <p>Saludos,<br>Equipo VotaSoft</p>
                `,
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

// Restablecer Contraseña
exports.restablecerContrasena = async (req, res) => {
    try {
        const { token, nuevaContrasena } = req.body;

        // Verificar el token JWT
        let payload;
        try {
            payload = jwt.verify(token, "tu_clave_secreta");
        } catch (err) {
            return res.status(400).json({ message: 'Token inválido o expirado' });
        }

        const administrador = await Administrador.findById(payload.administrador_id);
        if (!administrador) {
            return res.status(400).json({ message: 'Administrador no encontrado' });
        }

        // Actualizar la contraseña
        administrador.contrasena = bcrypt.hashSync(nuevaContrasena, 12);
        administrador.resetPasswordToken = undefined;
        administrador.resetPasswordExpires = undefined;
        await administrador.save();

        res.status(200).json({ message: 'Contraseña actualizada correctamente' });
    } catch (error) {
        console.error('Error al restablecer la contraseña:', error);
        res.status(500).json({ error: 'Error al restablecer la contraseña' });
    }
};
