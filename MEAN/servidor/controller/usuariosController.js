const ExcelJS = require('exceljs');
const Usuarios = require('../models/Usuarios');
const fs = require('fs').promises;

const handleError = (res, error, message) => {
    console.error(message, error);
    res.status(500).json({ error: message });
};

exports.crearUsuarios = async (req, res) => {
    try {
        const usuario = new Usuarios(req.body);
        await usuario.save();
        res.status(201).json(usuario);
    } catch (error) {
        handleError(res, error, 'Error al crear usuario');
    }
};

exports.obtenerUsuarios = async (req, res) => {
    try {
        const usuarios = await Usuarios.find();
        res.json(usuarios);
    } catch (error) {
        handleError(res, error, 'Error al obtener usuarios');
    }
};

exports.actualizarUsuarios = async (req, res) => {
    try {
        const { id } = req.params;
        const usuario = await Usuarios.findByIdAndUpdate(id, req.body, { new: true, runValidators: true });
        if (!usuario) {
            return res.status(404).json({ error: "Usuario no encontrado" });
        }
        res.json(usuario);
    } catch (error) {
        handleError(res, error, 'Error al actualizar usuario');
    }
};

exports.buscarUsuarios = async (req, res) => {
    try {
        const { tipoDoc, numDoc } = req.query;
        const usuario = await Usuarios.findOne({ tipoDoc, numDoc });
        if (!usuario) {
            return res.status(404).json({ error: 'Usuario no encontrado' });
        }
        res.json(usuario);
    } catch (error) {
        handleError(res, error, 'Error al buscar usuario');
    }
};

exports.eliminarUsuario = async (req, res) => {
    try {
        const { id } = req.params;
        const usuario = await Usuarios.findByIdAndDelete(id);
        if (!usuario) {
            return res.status(404).json({ error: "Usuario no encontrado" });
        }
        res.json({ mensaje: "Usuario eliminado" });
    } catch (error) {
        handleError(res, error, 'Error al eliminar usuario');
    }
};

exports.eliminarUsuarios = async (req, res) => {
    try {
        const { ids } = req.body;
        if (!ids || !Array.isArray(ids) || ids.length === 0) {
            return res.status(400).json({ error: 'IDs inválidos' });
        }
        await Usuarios.deleteMany({ _id: { $in: ids } });
        res.json({ mensaje: 'Usuarios eliminados correctamente' });
    } catch (error) {
        handleError(res, error, 'Error al eliminar usuarios');
    }
};

exports.validarUsuario = async (req, res) => {
    try {
        const { tipoDoc, numDoc } = req.body;
        const usuario = await Usuarios.findOne({ tipoDoc, numDoc });
        if (!usuario) {
            return res.status(404).json({ error: 'Usuario no encontrado' });
        }
        res.json(usuario);
    } catch (error) {
        handleError(res, error, 'Error al validar usuario');
    }
};

exports.subirArchivo = async (req, res) => {
    if (!req.file || !req.file.path) {
        return res.status(400).json({ error: 'No se ha subido ningún archivo' });
    }

    try {
        const filePath = req.file.path;
        const workbook = new ExcelJS.Workbook();
        await workbook.xlsx.readFile(filePath);
        const worksheet = workbook.worksheets[0];
        
        const jsonData = [];
        worksheet.eachRow({ includeEmpty: false }, (row, rowNumber) => {
            if (rowNumber < 6) return; // Ignorar las primeras 5 filas

            const [nombre, apellidos, tipoDoc, numDoc] = row.values.slice(1, 5);
            if (!nombre || !apellidos || !tipoDoc || !numDoc) {
                throw new Error('Campos requeridos vacíos');
            }
            jsonData.push({ nombre, apellidos, tipoDoc, numDoc });
        });

        await Usuarios.insertMany(jsonData);
        await fs.unlink(filePath);
        res.json({ mensaje: 'Archivo procesado y usuarios creados' });
    } catch (error) {
        handleError(res, error, 'Error al procesar archivo');
    }
};

exports.generarCodigoVerificacion = async (req, res) => {
    try {
        const { tipoDoc, numDoc, eleccionId } = req.body;
        const usuario = await Usuarios.findOne({ tipoDoc, numDoc });
        if (!usuario) {
            return res.status(404).json({ error: 'Usuario no encontrado' });
        }

        let votacion = usuario.votaciones.find(v => v.eleccion.toString() === eleccionId);
        if (votacion && votacion.haVotado) {
            return res.status(400).json({ error: 'Usuario ya ha votado en esta elección' });
        }

        const codigo = Math.random().toString(36).substr(2, 6).toUpperCase();
        const codigoExpiracion = new Date(Date.now() + 10 * 60000);

        if (!votacion) {
            usuario.votaciones.push({ eleccion: eleccionId, codigoVerificacion: codigo, codigoExpiracion, haVotado: false });
        } else {
            votacion.codigoVerificacion = codigo;
            votacion.codigoExpiracion = codigoExpiracion;
        }

        await usuario.save();
        res.json({ codigo });
    } catch (error) {
        handleError(res, error, 'Error al generar código de verificación');
    }
};

exports.verificarCodigo = async (req, res) => {
    try {
        const { tipoDoc, numDoc, codigo, eleccionId } = req.body;
        const usuario = await Usuarios.findOne({ tipoDoc, numDoc });
        if (!usuario) {
            return res.status(404).json({ error: "Usuario no encontrado" });
        }

        const votacion = usuario.votaciones.find(v => v.eleccion.toString() === eleccionId);
        if (!votacion || !votacion.codigoVerificacion) {
            return res.status(400).json({ error: "Código no generado para esta elección" });
        }

        if (votacion.haVotado) {
            return res.status(400).json({ error: "Usuario ya ha votado en esta elección" });
        }

        if (votacion.codigoVerificacion !== codigo) {
            return res.status(400).json({ error: "Código incorrecto" });
        }

        if (new Date() > votacion.codigoExpiracion) {
            return res.status(400).json({ error: "Código expirado" });
        }

        votacion.haVotado = true;
        votacion.codigoVerificacion = null;
        votacion.codigoExpiracion = null;

        await usuario.save();
        res.json({ mensaje: "Código verificado correctamente" });
    } catch (error) {
        handleError(res, error, 'Error al verificar código');
    }
};