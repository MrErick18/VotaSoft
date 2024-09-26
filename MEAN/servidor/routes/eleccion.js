const express = require('express');
const router = express.Router();

const eleccionController = require('../controller/eleccionController');

router.get('/pendientes', eleccionController.obtenerEleccionesPendientes);

router.post('/', eleccionController.crearEleccion);
router.get('/', eleccionController.obtenerEleccion);
router.put('/:id', eleccionController.actualizarEleccion);
router.get('/:id', eleccionController.buscarEleccion);
router.delete('/:id', eleccionController.eliminarEleccion);

module.exports= router;