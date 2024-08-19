const Voto = require("../models/Voto");

exports.crearVoto = async(req, res) => {
    try {
        let voto;
        voto = new Voto(req.body);
        await voto.save();
        res.send(voto)
    } catch(error){
        console.log(error);
        res.status(500).send('Ocurrio un Error')
    }
}

exports.obtenerVoto = async(req, res) =>{
    try{
        const voto = await Voto.find();
        res.json(voto)
    }catch(error){
        console.log(error);
        res.status(500).send('Ocurrio un error')
        
    }
}

exports.actualizarVoto = async(req, res) => {
    try {
        const { Usuario_id, Candidato_id, Eleccion_id, fechaEmision } = req.body;
        let voto = await Voto.findById(req.params.id);
        if (!voto) {return res.status(400).json({ msg: "Voto No Existe" });}
        voto.Usuario_id = Usuario_id;
        voto.Candidato_id = Candidato_id;
        voto.Eleccion_id = Eleccion_id;
        voto.fechaEmision = fechaEmision;
        voto = await Voto.findByIdAndUpdate({ _id: req.params.id }, voto, { new: true }
        );
        res.json(voto);
    } catch (error) {
        console.log(error);
        res.status(500).send("Ocurrió un Error al Actualizar");
    }
}

exports.buscarVoto = async(req, res) => {
    try{
        let voto = await Voto.findById(req.params.id);
        if(!voto){
            res.status(400).json({msg: 'Este Voto no Existe'});
        }
        res.json(voto);
    }catch(error){ 
        console.log(error);        
        res.status(500).send('Ocurrio Un Error Al Eliminar Voto')
    }
}

exports.eliminarVoto = async(req, res) => {
    try{
        let voto = await Voto.findById(req.params.id);
        if(!voto){
            res.status(400).json({msg: 'Este Voto no Existe'});
        }
        await Voto.findByIdAndDelete(req.params.id)
        res.json(voto);
    }catch(error){ 
        console.log(error);        
        res.status(500).send('Ocurrio Un Error ' + error)
    }
}
