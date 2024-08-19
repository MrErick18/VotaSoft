const Candidato = require("../models/Candidato");

exports.crearCandidato = async(req, res) => {
    try {
        let candidato;
        candidato = new Candidato(req.body);
        await candidato.save();
        res.send(candidato)
    } catch(error){
        console.log(error);
        res.status(500).send('Ocurrio un Error')
    }
}

exports.obtenerCandidato = async(req, res) =>{
    try{
        const candidato = await Candidato.find();
        res.json(candidato)
    }catch(error){
        console.log(error);
        res.status(500).send('Ocurrio un error')
        
    }
}

exports.actualizarCandidato = async(req, res) => {
    try {
        const { nombreCompleto, perfil,propuestas, foto} = req.body;
        let candidato = await Candidato.findById(req.params.id);
        if (!candidato) {return res.status(400).json({ msg: "Candidato No Existe" });}
        candidato.nombreCompleto = nombreCompleto;
        candidato.perfil = perfil;
        candidato.propuestas = propuestas;
        candidato.foto = foto;
        candidato = await Candidato.findByIdAndUpdate({ _id: req.params.id }, candidato, { new: true }
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