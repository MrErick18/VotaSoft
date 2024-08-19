const Resultados = require("../models/Resultados");

exports.crearResultados = async(req, res) => {
    try {
        let resultados;
        resultados = new Resultados(req.body);
        await resultados.save();
        res.send(resultados)
    } catch(error){
        console.log(error);
        res.status(500).send('Ocurrio un Error')
    }
}

exports.obtenerResultados = async(req, res) =>{
    try{
        const resultados = await Resultados.find();
        res.json(resultados)
    }catch(error){
        console.log(error);
        res.status(500).send('Ocurrio un error')
        
    }
}

exports.actualizarResultados = async(req, res) => {
    try {
        const {votosTotales, Eleccion_id, Candidato_id} = req.body;
        let resultados = await Resultados.findById(req.params.id);
        if (!resultados) {return res.status(400).json({ msg: "Resultados no existe" });}
        resultados.votosTotales = votosTotales;
        resultados.Eleccion_id = Eleccion_id;
        resultados.Candidato_id = Candidato_id;
        resultados = await Resultados.findByIdAndUpdate({ _id: req.params.id }, resultados, { new: true }
        );
        res.json(resultados);
    } catch (error) {
        console.log(error);
        res.status(500).send("Ocurrió un Error al Actualizar");
    }
}

exports.buscarResultados = async(req, res) => {
    try{
        let resultados = await Resultados.findById(req.params.id);
        if(!resultados){
            res.status(400).json({msg: 'Este Resultado no Existe'});
        }
        res.json(resultado);
    }catch(error){ 
        console.log(error);        
        res.status(500).send('Ocurrio Un Error Al Eliminar Resultado')
    }
}

exports.eliminarResultado = async(req, res) => {
    try{
        let resultados = await Resultados.findById(req.params.id);
        if(!resultados){
            res.status(400).json({msg: "Este Resultado No Existe"});
        }
        await Resultados.findByIdAndDelete(req.params.id);
        res.json({msg: "Resultado Eliminado"});
    }catch (error) {
        console.log("Error", error);
        res.status(500).send('Ocurrio Un Error ' + error);        
    }
}
