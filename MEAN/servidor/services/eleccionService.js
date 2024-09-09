const Eleccion = require('../models/Eleccion'); // Ajusta la ruta si es necesario

// Función para actualizar el estado de las elecciones
async function updateEleccionesEstado() {
    const hoy = new Date();
    hoy.setUTCHours(0, 0, 0, 0); // Ajusta la fecha para que sea UTC sin la parte de hora

    const inicioHoy = new Date(hoy);
    const finHoy = new Date(hoy);
    finHoy.setUTCHours(23, 59, 59, 999); // Ajusta el fin del día a las 23:59:59.999 UTC

    // Actualiza el estado a 'Finalizada' para elecciones pasadas
    await Eleccion.updateMany(
        { fecha: { $lt: inicioHoy }, estado: { $ne: 'Finalizada' } },
        { $set: { estado: 'Finalizada' } }
    );

    // Actualiza el estado a 'En Curso' para elecciones que ocurren hoy
    await Eleccion.updateMany(
        { fecha: { $gte: inicioHoy, $lte: finHoy }, estado: { $ne: 'En Curso' } },
        { $set: { estado: 'En Curso' } }
    );

    // Actualiza el estado a 'Pendiente' para elecciones futuras
    await Eleccion.updateMany(
        { fecha: { $gt: finHoy }, estado: { $ne: 'Pendiente' } },
        { $set: { estado: 'Pendiente' } }
    );
}

module.exports = { updateEleccionesEstado };
