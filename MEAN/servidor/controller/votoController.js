const Voto = require("../models/Voto");
const Eleccion = require("../models/Eleccion");
const Candidato = require("../models/Candidato");
const moment = require('moment-timezone');

const handleError = (res, error, message) => {
    console.error(message, error);
    res.status(500).json({ error: message });
};

exports.crearVoto = async (req, res) => {
    try {
        const { Usuarios_id, Candidato_id, Eleccion_id, esVotoEnBlanco } = req.body;

        const eleccion = await Eleccion.findById(Eleccion_id);
        if (!eleccion) {
            return res.status(404).json({ error: "La elección no existe" });
        }
        if (eleccion.estado !== 'En Curso') {
            return res.status(400).json({ error: "La elección no está activa" });
        }

        const votoExistente = await Voto.findOne({ Usuarios_id, Eleccion_id });
        if (votoExistente) {
            return res.status(400).json({ error: "El usuario ya ha votado en esta elección" });
        }

        if (!esVotoEnBlanco) {
            const candidato = await Candidato.findOne({ _id: Candidato_id, eleccion: Eleccion_id });
            if (!candidato) {
                return res.status(400).json({ error: "El candidato no pertenece a esta elección" });
            }
        }

        const fechaEmisionColombia = moment().tz('America/Bogota').toDate();
        const nuevoVoto = new Voto({
            Usuarios_id,
            Candidato_id: esVotoEnBlanco ? null : Candidato_id,
            Eleccion_id,
            fechaEmision: fechaEmisionColombia,
            esVotoEnBlanco
        });

        await nuevoVoto.save();
        res.status(201).json({ mensaje: "Voto registrado con éxito", voto: nuevoVoto });
    } catch (error) {
        handleError(res, error, 'Error al registrar el voto');
    }
};

exports.obtenerVotos = async (req, res) => {
    try {
        const votos = await Voto.find()
            .populate('Eleccion_id', 'nombre')
            .populate('Candidato_id', 'nombreCompleto');
        res.json(votos);
    } catch (error) {
        handleError(res, error, 'Error al obtener los votos');
    }
};

exports.obtenerVotosPorEleccion = async (req, res) => {
    try {
        const { eleccionId } = req.params;
        const votos = await Voto.find({ Eleccion_id: eleccionId })
            .populate('Candidato_id', 'nombreCompleto')
            .populate('Usuarios_id', 'nombre');
        res.json(votos);
    } catch (error) {
        handleError(res, error, 'Error al obtener los votos de la elección');
    }
};

exports.obtenerEstadisticasVotos = async (req, res) => {
    try {
        const { eleccionId } = req.params;
        const votos = await Voto.find({ Eleccion_id: eleccionId }).populate('Candidato_id', 'nombreCompleto');
        
        const totalVotos = votos.length;
        const votosPorCandidato = votos.reduce((acc, voto) => {
            if (voto.esVotoEnBlanco) {
                acc['Voto en Blanco'] = (acc['Voto en Blanco'] || 0) + 1;
            } else {
                const candidatoNombre = voto.Candidato_id.nombreCompleto;
                acc[candidatoNombre] = (acc[candidatoNombre] || 0) + 1;
            }
            return acc;
        }, {});

        const estadisticas = {
            totalVotos,
            votosPorCandidato,
            porcentajes: Object.entries(votosPorCandidato).map(([nombre, votos]) => ({
                nombre,
                porcentaje: (votos / totalVotos * 100).toFixed(2)
            }))
        };

        res.json(estadisticas);
    } catch (error) {
        handleError(res, error, 'Error al obtener estadísticas de votos');
    }
};