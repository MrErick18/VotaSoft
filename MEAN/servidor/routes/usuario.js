// routes/usuario.js
const express = require('express');
const router = express.Router();
const upload = require('../config/multer'); // Importar configuración de multer
const usuariosController = require('../controller/usuariosController');

// Rutas para usuarios
router.post('/', usuariosController.crearUsuarios);
router.get('/', usuariosController.obtenerUsuarios);
router.put('/:id', usuariosController.actualizarUsusarios);
router.get('/:id', usuariosController.buscarUsuarios);
router.delete('/:id', usuariosController.eliminarUsuarios);
router.get('/validar', usuariosController.validarUsuario);
router.post('/subirArchivo', upload.single('file'), usuariosController.subirArchivo);

module.exports = router;
