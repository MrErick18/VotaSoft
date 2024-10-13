const Candidato = require("../models/Candidato");
const Eleccion = require('../models/Eleccion');

const handleError = (res, error, message = 'Ocurrió un error') => {
    console.error(error);
    res.status(500).send(message);
};

const verifyElectionState = async (eleccionId) => {
    const eleccion = await Eleccion.findById(eleccionId);
    if (!eleccion) {
        throw new Error("La elección no existe");
    }
    if (eleccion.estado !== 'Pendiente') {
        throw new Error("No se pueden realizar cambios en una elección que ya está en curso o ha finalizado");
    }
    return eleccion;
};

exports.crearCandidato = async (req, res) => {
    try {
        const { eleccion: eleccionId, ...candidatoData } = req.body;
        await verifyElectionState(eleccionId);
        const candidato = new Candidato({ ...candidatoData, eleccion: eleccionId });
        await candidato.save();
        res.status(201).json(candidato);
    } catch (error) {
        handleError(res, error, error.message);
    }
};

exports.obtenerCandidato = async (req, res) => {
    try {
        const candidatos = await Candidato.find().populate('eleccion', 'nombre');
        res.json(candidatos);
    } catch (error) {
        handleError(res, error);
    }
};

exports.actualizarCandidato = async (req, res) => {
    try {
        const { eleccion: eleccionId, ...candidatoData } = req.body;
        await verifyElectionState(eleccionId);
        
        const candidato = await Candidato.findByIdAndUpdate(
            req.params.id,
            { ...candidatoData, eleccion: eleccionId },
            { new: true, runValidators: true }
        );
        if (!candidato) {
            return res.status(404).json({ msg: "Candidato No Existe" });
        }
        res.json(candidato);
    } catch (error) {
        handleError(res, error, error.message);
    }
};

exports.buscarCandidato = async (req, res) => {
    try {
        const candidato = await Candidato.findById(req.params.id);
        if (!candidato) {
            return res.status(404).json({ msg: 'Este Candidato no Existe' });
        }
        res.json(candidato);
    } catch (error) {
        handleError(res, error, 'Ocurrió un error al buscar el candidato');
    }
};

exports.eliminarCandidato = async (req, res) => {
    try {
        const candidato = await Candidato.findById(req.params.id);
        if (!candidato) {
            return res.status(404).json({ msg: "Este Candidato No Existe" });
        }
        
        await verifyElectionState(candidato.eleccion);
        
        await Candidato.findByIdAndDelete(req.params.id);
        res.json({ msg: "Candidato Eliminado" });
    } catch (error) {
        handleError(res, error, error.message);
    }
};

exports.obtenerCandidatosPorEleccion = async (req, res) => {
    try {
        const candidatos = await Candidato.find({ eleccion: req.params.eleccionId }).populate('eleccion', 'nombre');
        res.json(candidatos);
    } catch (error) {
        handleError(res, error, 'Ocurrió un error al obtener candidatos por elección');
    }
};
