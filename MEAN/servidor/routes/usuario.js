const express = require('express');
const router = express.Router();

const usuariosController = require('../controller/UsuariosController');

router.post('/', usuariosController.crearUsuarios);
router.get('/', usuariosController.obtenerUsuarios);
router.put('/:id', usuariosController.actualizarUsusarios);
router.get('/:id', usuariosController.buscarUsuarios);
router.delete('/:id', usuariosController.eliminarUsuarios);

module.exports = router;