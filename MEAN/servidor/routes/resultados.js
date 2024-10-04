const express = require('express');
const router = express.Router();
const resultadosController = require('../controller/resultadosController');

router.get('/eleccion/:eleccionId', resultadosController.obtenerResultadosPorEleccion);
router.post('/pdf/:eleccionId', resultadosController.generarPDF);

module.exports = router;