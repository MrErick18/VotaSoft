const Eleccion = require("../models/Eleccion");

exports.crearEleccion = async(req, res) =>{
    try {
        let eleccion;
        eleccion = new Eleccion(req.body);
        await eleccion.save();
        res.status(candidato)
    } catch (error) {
        console.log(error);
        res.status(500).send('Ocurrio un Error')        
    }
}

exports.obtenerEleccion = async(req, res) =>{
    try {
        const eleccion = await Eleccion.find();
        res.json(eleccion)
    } catch (error) {
        console.log(error);
        res.status(500).send('Ocurrio un Error')        
    }
}

exports.actualizarEleccion = async(req, res) =>{
    try {
        const {nombre, tipo, fecha, estado} = req.body
        let eleccion = await Eleccion.findById(req.params.id);
        if(!eleccion) {return res.status(400).json({msg: "Eleccion no existe"});}
        eleccion.nombre = nombre;
        eleccion.tipo = tipo;
        eleccion.fecha = fecha;
        eleccion.estado = estado;
        eleccion = await Eleccion.findByIdAndUpdate({_id: req.params.id}, eleccion, {new: true}
        );
        res.json(eleccion);
    } catch (error) {
        console.log(error);
        res.status(500).send("Ocurrio un Error al Actualizar")
    }
}

exports.buscarEleccion = async(req, res) =>{
    try {
        let eleccion = await Eleccion.findById(req.params.id);
        if(!eleccion) {
            res.status(400).json({msg: "Esta Eleccion no existe"});
        }
        res.json(eleccion)
    } catch (error) {
        console.log(error);
        res.status(500).send('Ocurrio un Error Al Eliminar Eleccion')        
    }
}

exports.eliminarEleccion = async(req, res) =>{
    try {
        let eleccion = await Eleccion.findById(req.params.id);
        if(!eleccion) {
            res.status(400).json({msg: "Esta Eleccion no existe"});
        }
        await Eleccion.findByIdAndDelete(req.params.id);
        res.json({msg: "Eleccion Eliminada"})
    } catch (error) {
        console.log(error);
        res.status(500).send('Ocurrio un Error Al Eliminar Eleccion')        
    }
}