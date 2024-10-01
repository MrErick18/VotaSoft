const Voto = require("../models/Voto");
const Eleccion = require("../models/Eleccion");
const Candidato = require("../models/Candidato");
const moment = require('moment-timezone');

exports.crearVoto = async (req, res) => {
    try {
        const { Usuarios_id, Candidato_id, Eleccion_id } = req.body;

        // Verificar si la elección existe y está activa
        const eleccion = await Eleccion.findById(Eleccion_id);

        if (!eleccion) {
            return res.status(400).json({ msg: "La elección no existe" });
        }

        if (eleccion.estado !== 'Pendiente') {
            return res.status(400).json({ msg: "La elección no está activa" });
        }

        // Verificar si el candidato pertenece a esta elección
        const candidato = await Candidato.findOne({ _id: Candidato_id, eleccion: Eleccion_id });
        if (!candidato) {
            return res.status(400).json({ msg: "El candidato no pertenece a esta elección" });
        }

        // Verificar si el usuario ya ha votado en esta elección
        const votoExistente = await Voto.findOne({ Usuarios_id, Eleccion_id });
        if (votoExistente) {
            return res.status(400).json({ msg: "El usuario ya ha votado en esta elección" });
        }

        // Crear el voto
        const fechaEmisionColombia = moment().tz('America/Bogota').toDate();
        const nuevoVoto = new Voto({
            Usuarios_id,
            Candidato_id,
            Eleccion_id,
            fechaEmision: fechaEmisionColombia
        });

        await nuevoVoto.save();
        res.status(201).json({ msg: "Voto registrado con éxito", voto: nuevoVoto });
    } catch (error) {
        console.error('Error detallado:', error);
        res.status(500).json({ msg: 'Ocurrió un error al registrar el voto', error: error.message });
    }
}

exports.obtenerVotos = async (req, res) => {
    try {
        const votos = await Voto.find().populate('Eleccion_id', 'nombre').populate('Candidato_id', 'nombreCompleto');
        res.json(votos);
    } catch (error) {
        console.log(error);
        res.status(500).json({ msg: 'Ocurrió un error al obtener los votos' });
    }
}

exports.obtenerVotosPorEleccion = async (req, res) => {
    try {
        const { eleccionId } = req.params;
        const votos = await Voto.find({ Eleccion_id: eleccionId })
            .populate('Candidato_id', 'nombreCompleto')
            .populate('Usuarios_id', 'nombre');
        res.json(votos);
    } catch (error) {
        console.log(error);
        res.status(500).json({ msg: 'Ocurrió un error al obtener los votos de la elección' });
    }
}