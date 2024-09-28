const ExcelJS = require('exceljs');
const Usuarios = require('../models/Usuarios');
const path = require('path');
const fs = require('fs');

// Crear usuario
exports.crearUsuarios = async (req, res) => {
    try {
        let usuarios = new Usuarios(req.body);
        await usuarios.save();
        res.send(usuarios);
    } catch (error) {
        console.log(error);
        res.status(500).send('Ocurrió un error');
    }
};

// Obtener usuarios
exports.obtenerUsuarios = async (req, res) => {
    try {
        const usuarios = await Usuarios.find();
        res.json(usuarios);
    } catch (error) {
        console.log(error);
        res.status(500).send('Ocurrió un error');
    }
};

// Actualizar usuario
exports.actualizarUsuarios = async (req, res) => {
    try {
        const { nombre, apellidos, tipoDoc, numDoc } = req.body;
        let usuario = await Usuarios.findById(req.params.id);
        if (!usuario) { return res.status(400).json({ msg: "Usuario no existe" }); }
        usuario.nombre = nombre;
        usuario.apellidos = apellidos;
        usuario.tipoDoc = tipoDoc;
        usuario.numDoc = numDoc;
        usuario = await Usuarios.findByIdAndUpdate({ _id: req.params.id }, usuario, { new: true });
        res.json(usuario);
    } catch (error) {
        console.log(error);
        res.status(500).send('Ocurrió un error al actualizar');
    }
};

// Buscar usuario
exports.buscarUsuarios = async (req, res) => {
    try {
        const { tipoDoc, numDoc } = req.query;
        const usuario = await Usuarios.findOne({ tipoDoc, numDoc });
        if (!usuario) {
            return res.status(404).json({ msg: 'Usuario no encontrado' });
        }
        res.json(usuario);
    } catch (error) {
        console.log(error);
        res.status(500).send('Error en el servidor');
    }
};

// Eliminar usuario
exports.eliminarUsuario = async (req, res) => {
    try {
        console.log(`Intentando eliminar usuario con ID: ${req.params.id}`);
        let usuario = await Usuarios.findById(req.params.id);
        if (!usuario) {
            console.log(`Usuario con ID: ${req.params.id} no encontrado`);
            return res.status(400).json({ msg: "Usuario no existe" });
        }
        await Usuarios.findByIdAndDelete(req.params.id);
        console.log(`Usuario con ID: ${req.params.id} eliminado`);
        res.json({ msg: "Usuario eliminado" });
    } catch (error) {
        console.error("Error al eliminar el usuario:", error);
        res.status(500).json({ msg: 'Ocurrió un error al eliminar el usuario', error: error.message });
    }
};

// Función para eliminar múltiples usuarios
exports.eliminarUsuarios = async (req, res) => {
    try {
        const { ids } = req.body;

        if (!ids || !Array.isArray(ids) || ids.length === 0) {
            return res.status(400).json({ error: 'No se proporcionaron IDs válidos' });
        }

        await Usuarios.deleteMany({ _id: { $in: ids } });
        res.status(200).json({ message: 'Usuarios eliminados correctamente' });
    } catch (error) {
        console.error('Error al eliminar los usuarios:', error);
        res.status(500).json({ error: 'Error al eliminar los usuarios' });
    }
};

// Validar usuario
exports.validarUsuario = async (req, res) => {
    try {
        const { tipoDoc, numDoc } = req.body;
        const usuario = await Usuarios.findOne({ tipoDoc, numDoc });
        if (!usuario) {
            return res.status(404).json({ msg: 'Usuario no encontrado' });
        }
        res.json(usuario);
    } catch (error) {
        console.error(error);
        res.status(500).send('Ocurrió un error');
    }
};

// Subir archivo
exports.subirArchivo = async (req, res) => {
    try {
        if (!req.file || !req.file.path) {
            return res.status(400).send('No se ha subido ningún archivo');
        }

        const filePath = req.file.path;

        const workbook = new ExcelJS.Workbook();
        await workbook.xlsx.readFile(filePath);
        const worksheet = workbook.worksheets[0];
        const jsonData = [];

        worksheet.eachRow({ includeEmpty: false }, (row, rowNumber) => {
            if (rowNumber < 6) return; // Ignorar la primera fila si contiene encabezados

            const nombre = row.getCell(1).value;
            const apellidos = row.getCell(2).value;
            const tipoDoc = row.getCell(3).value;
            const numDoc = row.getCell(4).value;

            if (!nombre || !apellidos || !tipoDoc || !numDoc) {
                throw new Error('Algunos campos requeridos están vacíos');
            }

            jsonData.push({ nombre, apellidos, tipoDoc, numDoc });
        });

        await Usuarios.insertMany(jsonData);

        fs.unlinkSync(filePath);

        res.json({ message: 'Archivo subido y usuarios creados' });
    } catch (error) {
        console.error('Error al subir el archivo:', error.message);
        res.status(500).json({ error: error.message });
    }
};

// Generar código de verificación
exports.generarCodigoVerificacion = async (req, res) => {
    try {
        const { tipoDoc, numDoc, eleccionId } = req.body;
        console.log('Generando código para:', { tipoDoc, numDoc, eleccionId });

        const usuario = await Usuarios.findOne({ tipoDoc, numDoc });
        
        if (!usuario) {
            console.log('Usuario no encontrado');
            return res.status(404).json({ msg: 'Usuario no encontrado' });
        }

        console.log('Usuario encontrado:', JSON.stringify(usuario, null, 2));

        let votacion = usuario.votaciones.find(v => v.eleccion.toString() === eleccionId);
        console.log('Votación existente:', votacion);

        if (votacion && votacion.haVotado) {
            console.log('Usuario ya ha votado en esta elección');
            return res.status(400).json({ msg: 'Este usuario ya ha votado en esta elección' });
        }

        const codigo = Math.random().toString(36).substr(2, 6).toUpperCase();
        console.log('Nuevo código generado:', codigo);
        
        if (!votacion) {
            votacion = {
                eleccion: eleccionId,
                codigoVerificacion: codigo,
                codigoExpiracion: new Date(Date.now() + 10 * 60000),
                haVotado: false
            };
            usuario.votaciones.push(votacion);
        } else {
            votacion.codigoVerificacion = codigo;
            votacion.codigoExpiracion = new Date(Date.now() + 10 * 60000);
        }

        console.log('Usuario antes de guardar:', JSON.stringify(usuario, null, 2));
        await usuario.save();
        console.log('Usuario después de guardar:', JSON.stringify(usuario, null, 2));

        res.json({ codigo });
    } catch (error) {
        console.error('Error al generar código:', error);
        res.status(500).send('Ocurrió un error al generar el código');
    }
};

// Verificar código
exports.verificarCodigo = async (req, res) => {
    try {
        const { tipoDoc, numDoc, codigo, eleccionId } = req.body;
        console.log('Verificando código:', { tipoDoc, numDoc, codigo, eleccionId });

        const usuario = await Usuarios.findOne({ tipoDoc, numDoc });
        
        if (!usuario) {
            console.log('Usuario no encontrado');
            return res.status(404).json({ msg: "Usuario no encontrado" });
        }

        console.log('Usuario encontrado:', JSON.stringify(usuario, null, 2));

        const votacion = usuario.votaciones.find(v => v.eleccion.toString() === eleccionId);
        console.log('Votación encontrada:', votacion);

        if (!votacion || !votacion.codigoVerificacion) {
            console.log('No se ha generado código para esta elección');
            return res.status(400).json({ msg: "No se ha generado código para esta elección. Por favor, solicite un nuevo código." });
        }

        if (votacion.haVotado) {
            console.log('Usuario ya ha votado en esta elección');
            return res.status(400).json({ msg: "Ya has votado en esta elección" });
        }

        if (votacion.codigoVerificacion !== codigo) {
            console.log('Código incorrecto. Esperado:', votacion.codigoVerificacion, 'Recibido:', codigo);
            return res.status(400).json({ msg: "Código incorrecto" });
        }

        if (new Date() > votacion.codigoExpiracion) {
            console.log('Código expirado');
            return res.status(400).json({ msg: "Código expirado. Por favor, solicite un nuevo código." });
        }

        votacion.haVotado = true;
        votacion.codigoVerificacion = null;
        votacion.codigoExpiracion = null;

        console.log('Usuario antes de guardar:', JSON.stringify(usuario, null, 2));
        await usuario.save();
        console.log('Usuario después de guardar:', JSON.stringify(usuario, null, 2));

        console.log('Código verificado correctamente');
        res.json({ msg: "Código verificado correctamente" });
    } catch (error) {
        console.error('Error en verificarCodigo:', error);
        res.status(500).json({ msg: 'Error al verificar código', error: error.message });
    }
};