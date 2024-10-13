const Eleccion = require("../models/Eleccion");

const handleError = (res, error, message) => {
    console.error(error);
    res.status(500).json({ message: message || 'Ocurrió un error' });
};

exports.crearEleccion = async (req, res) => {
    try {
        const eleccion = new Eleccion(req.body);
        await eleccion.save();
        res.status(201).json({ message: 'Elección creada con éxito' });
    } catch (error) {
        handleError(res, error, 'Error al crear la elección');
    }
};

exports.obtenerEleccion = async (req, res) => {
    try {
        const elecciones = await Eleccion.find();
        res.json(elecciones);
    } catch (error) {
        handleError(res, error);
    }
};

exports.actualizarEleccion = async (req, res) => {
    try {
        const eleccion = await Eleccion.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );
        if (!eleccion) {
            return res.status(404).json({ message: "Elección no existe" });
        }
        res.json(eleccion);
    } catch (error) {
        handleError(res, error, "Error al actualizar la elección");
    }
};

exports.buscarEleccion = async (req, res) => {
    try {
        const eleccion = await Eleccion.findById(req.params.id);
        if (!eleccion) {
            return res.status(404).json({ message: "Esta elección no existe" });
        }
        res.json(eleccion);
    } catch (error) {
        handleError(res, error);
    }
};

exports.eliminarEleccion = async (req, res) => {
    try {
        const eleccion = await Eleccion.findByIdAndDelete(req.params.id);
        if (!eleccion) {
            return res.status(404).json({ message: "Esta elección no existe" });
        }
        res.json({ message: "Elección eliminada" });
    } catch (error) {
        handleError(res, error, 'Error al eliminar la elección');
    }
};

exports.obtenerEleccionesEnCurso = async (req, res) => {
    try {
        const elecciones = await Eleccion.find({ estado: 'En Curso' });
        res.json(elecciones);
    } catch (error) {
        handleError(res, error, 'Error al obtener elecciones en curso');
    }
};

exports.obtenerEleccionesPendientes = async (req, res) => {
    try {
        const eleccionesPendientes = await Eleccion.find({ estado: 'Pendiente' });
        res.json(eleccionesPendientes);
    } catch (error) {
        handleError(res, error, 'Error al obtener las elecciones pendientes');
    }
};