const Candidato = require("../models/Candidato");
const Eleccion = require('../models/Eleccion')

exports.crearCandidato = async (req, res) => {
    try {
        const { eleccion: eleccionId, ...candidatoData } = req.body;
        
        // Verificar si la elección existe y está pendiente
        const eleccion = await Eleccion.findOne({ _id: eleccionId, estado: 'Pendiente' });
        if (!eleccion) {
            return res.status(400).json({ msg: "La elección no existe o no está pendiente" });
        }

        const candidato = new Candidato({
            ...candidatoData,
            eleccion: eleccionId
        });
        
        await candidato.save();
        res.status(201).json(candidato);
    } catch (error) {
        console.log(error);
        res.status(500).send('Ocurrió un Error');
    }
}

exports.obtenerCandidato = async(req, res) =>{
    try{
        const candidatos = await Candidato.find().populate('eleccion', 'nombre');
        res.json(candidatos)
    }catch(error){
        console.log(error);
        res.status(500).send('Ocurrio un error')
    }
}

exports.actualizarCandidato = async (req, res) => {
    try {
        const { eleccion: eleccionId, ...candidatoData } = req.body;
        
        // Verificar si la elección existe y está pendiente
        const eleccion = await Eleccion.findOne({ _id: eleccionId, estado: 'Pendiente' });
        if (!eleccion) {
            return res.status(400).json({ msg: "La elección no existe o no está pendiente" });
        }

        let candidato = await Candidato.findById(req.params.id);
        if (!candidato) {
            return res.status(404).json({ msg: "Candidato No Existe" });
        }
        
        candidato = await Candidato.findByIdAndUpdate(
            req.params.id,
            { ...candidatoData, eleccion: eleccionId },
            { new: true }
        );
        
        res.json(candidato);
    } catch (error) {
        console.log(error);
        res.status(500).send("Ocurrió un Error al Actualizar");
    }
}

exports.buscarCandidato = async(req, res) => {
    try{
        let candidato = await Candidato.findById(req.params.id);
        if(!candidato){
            res.status(400).json({msg: 'Este Candidato no Existe'});
        }
        res.json(candidato);
    }catch(error){ 
        console.log(error);        
        res.status(500).send('Ocurrio Un Error Al Eliminar Candidato')
    }
}

exports.eliminarCandidato = async(req, res) => {
    try{
        let candidato = await Candidato.findById(req.params.id);
        if(!candidato){
            res.status(400).json({msg: "Este Canidato No Existe"});
        }
        await Candidato.findByIdAndDelete(req.params.id);
        res.json({msg: "Candidato Eliminado"});
    }catch (error) {
        console.log("Error", error);
        res.status(500).send('Ocurrio Un Error ' + error);        
    }
}

exports.obtenerCandidatosPorEleccion = async (req, res) => {
    try {
        const candidatos = await Candidato.find({ eleccion: req.params.eleccionId }).populate('eleccion', 'nombre');
        res.json(candidatos);
    } catch (error) {
        console.log(error);
        res.status(500).send('Ocurrió un error');
    }
}