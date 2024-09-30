const express = require('express');
const router = express.Router();

const votoController = require('../controller/votoController');

router.post('/', votoController.crearVoto);
router.get('/', votoController.obtenerVotos);
router.get('/eleccion/:eleccionId', votoController.obtenerVotosPorEleccion);

module.exports = router;