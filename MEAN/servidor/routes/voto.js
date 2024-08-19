const express = require('express');
const router = express.Router();

const votoController = require('../controller/VotoController');

router.post('/', votoController.crearVoto);
router.get('/', votoController.obtenerVoto);
router.put('/:id', votoController.actualizarVoto);
router.get('/:id', votoController.buscarVoto);
router.delete('/:id', votoController.eliminarVoto);

module.exports = router;