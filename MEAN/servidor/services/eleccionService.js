const Eleccion = require('../models/Eleccion');
const moment = require('moment-timezone');

async function updateEleccionesEstado() {
    const zonaBogota = 'America/Bogota';
    const ahora = moment().tz(zonaBogota);
    
    const inicioHoy = ahora.clone().startOf('day');
    const finHoy = ahora.clone().endOf('day');

    // Actualiza el estado a 'Finalizada' para elecciones pasadas
    await Eleccion.updateMany(
        { 
            fecha: { $lt: inicioHoy.toDate() }, 
            estado: { $ne: 'Finalizada' } 
        },
        { $set: { estado: 'Finalizada' } }
    );

    // Actualiza el estado a 'En Curso' para elecciones que ocurren hoy
    await Eleccion.updateMany(
        { 
            fecha: { 
                $gte: inicioHoy.toDate(), 
                $lte: finHoy.toDate() 
            }, 
            estado: { $ne: 'En Curso' } 
        },
        { $set: { estado: 'En Curso' } }
    );

    // Actualiza el estado a 'Pendiente' para elecciones futuras
    await Eleccion.updateMany(
        { 
            fecha: { $gt: finHoy.toDate() }, 
            estado: { $ne: 'Pendiente' } 
        },
        { $set: { estado: 'Pendiente' } }
    );

    console.log(`Estados de elecciones actualizados para ${ahora.format('YYYY-MM-DD HH:mm:ss')} hora de Bogotá`);
}

module.exports = { updateEleccionesEstado };