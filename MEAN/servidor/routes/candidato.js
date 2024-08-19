const express = require('express');
const router = express.Router();

const candidatoController = require("../controller/candidato");

router.post('/', candidatoController.crearCandidato);
router.get('/', candidatoController.obtenerCandidato);
router.put('/:id', candidatoController.actualizarCandidato);
router.get('/:id', candidatoController.buscarCandidato);
router.delete('/:id', candidatoController.eliminarCandidato);

module.exports = router;