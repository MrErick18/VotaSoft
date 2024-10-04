const Eleccion = require("../models/Eleccion");

// Crear una nueva elección
exports.crearEleccion = async(req, res) =>{
    try {
        let eleccion = new Eleccion(req.body);
        await eleccion.save();
        res.status(201).json({ message: 'Elección creada con éxito' });
    } catch (error) {
        console.log(error);
        res.status(500).send('Ocurrió un Error');
    }
}

// Obtener todas las elecciones
exports.obtenerEleccion = async(req, res) =>{
    try {
        const elecciones = await Eleccion.find();
        res.json(elecciones);
    } catch (error) {
        console.log(error);
        res.status(500).send('Ocurrió un Error');
    }
}

// Actualizar una elección existente
exports.actualizarEleccion = async(req, res) =>{
    try {
        const { nombre, tipo, fecha, estado } = req.body;
        let eleccion = await Eleccion.findById(req.params.id);

        if (!eleccion) {
            return res.status(400).json({ msg: "Elección no existe" });
        }

        eleccion.nombre = nombre;
        eleccion.tipo = tipo;
        eleccion.fecha = fecha;
        eleccion.estado = estado;

        eleccion = await Eleccion.findByIdAndUpdate({ _id: req.params.id }, eleccion, { new: true });
        res.json(eleccion);
    } catch (error) {
        console.log(error);
        res.status(500).send("Ocurrió un Error al Actualizar");
    }
}

// Buscar una elección por ID
exports.buscarEleccion = async(req, res) =>{
    try {
        let eleccion = await Eleccion.findById(req.params.id);

        if (!eleccion) {
            return res.status(400).json({ msg: "Esta Elección no existe" });
        }

        res.json(eleccion);
    } catch (error) {
        console.log(error);
        res.status(500).send('Ocurrió un Error');
    }
}

// Eliminar una elección por ID
exports.eliminarEleccion = async(req, res) =>{
    try {
        let eleccion = await Eleccion.findById(req.params.id);

        if (!eleccion) {
            return res.status(400).json({ msg: "Esta Elección no existe" });
        }

        await Eleccion.findByIdAndDelete(req.params.id);
        res.json({ msg: "Elección Eliminada" });
    } catch (error) {
        console.log(error);
        res.status(500).send('Ocurrió un Error al Eliminar Elección');
    }
}

exports.obtenerEleccionesEnCurso = async (req, res) => {
    try {
        const elecciones = await Eleccion.find({ estado: 'En Curso' });
        res.json(elecciones);
    } catch (error) {
        console.error('Error al obtener elecciones pendientes:', error);
        res.status(500).json({ message: 'Error interno del servidor al obtener elecciones pendientes' });
    }
};