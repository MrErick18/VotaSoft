const express = require('express');
const router = express.Router();

const administradorController = require('../controller/administradorController');

router.post('/', administradorController.crearAdministrador);
router.get('/', administradorController.obtenerAdministrador);
router.put('/:id', administradorController.actualizarAdministrador);
router.get('/:id', administradorController.buscarAdministrador);
router.delete('/:id', administradorController.eliminarAdministrador);

module.exports = router;