const express = require('express');
const router = express.Router();
const administradorController = require('../controller/administradorController');

// Crear Administrador
router.post('/', administradorController.crearAdministrador);

// Obtener todos los Administradores
router.get('/', administradorController.obtenerAdministrador);

// Actualizar Administrador
router.put('/:id', administradorController.actualizarAdministrador);

// Buscar Administrador por ID
router.get('/:id', administradorController.buscarAdministrador);

// Eliminar Administrador
router.delete('/:id', administradorController.eliminarAdministrador);

// Login Administrador
router.post('/login', administradorController.loginAdministrador);

// Verificar Número de Documento
router.get('/verificar/:numDoc', administradorController.verificarNumeroDocumento);

// Verificar Correo y Enviar Token de Recuperación
router.get('/verificarCorreo/:correo', administradorController.verificarCorreo);

// Restablecer Contraseña
router.post('/restablecerContrasena', administradorController.restablecerContrasena);

router.get('/detalles/:numDoc', administradorController.obtenerDetallesAdministrador);

module.exports = router;
