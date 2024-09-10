// controllers/usuariosController.js
const ExcelJS = require('exceljs'); // Importar exceljs
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
exports.actualizarUsusarios = async (req, res) => {
    try {
        const { nombre, apellidos, tipoDoc, numDoc } = req.body;
        let usuarios = await Usuarios.findById(req.params.id);
        if (!usuarios) { return res.status(400).json({ msg: "Usuario no existe" }); }
        usuarios.nombre = nombre;
        usuarios.apellidos = apellidos;
        usuarios.tipoDoc = tipoDoc;
        usuarios.numDoc = numDoc;
        usuarios = await Usuarios.findByIdAndUpdate({ _id: req.params.id }, usuarios, { new: true });
        res.json(usuarios);
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
exports.eliminarUsuarios = async (req, res) => {
    try {
        let usuarios = await Usuarios.findById(req.params.id);
        if (!usuarios) {
            res.status(400).json({ msg: "Usuario no existe" });
        }
        await Usuarios.findByIdAndDelete(req.params.id);
        res.json({ msg: "Usuario eliminado" });
    } catch (error) {
        console.log("Error", error);
        res.status(500).send('Ocurrió un error');
    }
};

// Validar usuario
exports.validarUsuario = async (req, res) => {
    try {
        const { tipoDoc, numDoc } = req.query;
        const usuario = await Usuarios.findOne({ tipoDoc, numDoc });
        if (!usuario) {
            return res.status(404).json({ msg: 'Usuario no encontrado' });
        }
        res.json(usuario);
    } catch (error) {
        console.log(error);
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
            if (rowNumber === 1) return; // Ignorar la primera fila si contiene encabezados

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

        res.json({ message: 'Archivo subido y usuarios creados' }); // Cambia a JSON para manejar mejor la respuesta en el frontend
    } catch (error) {
        console.error('Error al subir el archivo:', error.message);
        res.status(500).json({ error: error.message }); // Cambia a JSON para manejar mejor la respuesta en el frontend
    }
};

