const express = require('express');
const router = express.Router();

const resultadosController = require('../controller/resultadosController');

router.post('/', resultadosController.crearResultados);
router.get('/', resultadosController.obtenerResultados);
router.put('/:id', resultadosController.actualizarResultados);
router.get('/:id', resultadosController.buscarResultados);
router.delete('/:id', resultadosController.eliminarResultado);

module.exports = router;