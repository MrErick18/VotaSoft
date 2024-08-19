const Administrador = require("../models/Administrador");

exports.crearAdministrador = async(req, res) =>{
    try {
        let administrador;
        administrador = new Administrador(req.body);
        await administrador.save();
        res.send(administrador)
    } catch (error) {
        console.log(error);
        res.status(500).send('Ocurrio un Error')        
    }
}

exports.obtenerAdministrador = async(req, res) =>{
    try{
        const administrador = await Administrador.find();
        res.json(administrador)
    }catch(error){
        console.log(error);
        res.status(500).send('Ocurrio un error')
        
    }
}

exports.actualizarAdministrador = async(req, res) => {
    try {
        const { nombre, apellido, tipoDoc, numDoc, correo, contrasena, cargo } = req.body;
        let administrador = await Administrador.findById(req.params.id);
        if (!administrador) {return res.status(400).json({ msg: "Administrador No Existe" });}
        administrador.nombre = nombre;
        administrador.apellido = apellido;
        administrador.tipoDoc = tipoDoc;
        administrador.numDoc = numDoc;
        administrador.correo = correo;
        administrador.contrasena = contrasena;
        administrador.cargo = cargo;
        administrador = await Administrador.findByIdAndUpdate({ _id: req.params.id }, administrador, { new: true }
        );
        res.json(administrador);
    } catch (error) {
        console.log(error);
        res.status(500).send("Ocurrió un Error al Actualizar");
    }
}

exports.buscarAdministrador = async(req, res) => {
    try{
        let administrador = await Administrador.findById(req.params.id);
        if(!administrador){
            res.status(400).json({msg: 'Este Administrador no Existe'});
        }
        res.json(administrador);
    }catch(error){ 
        console.log(error);        
        res.status(500).send('Ocurrio Un Error Al Eliminar Administrador')
    }
}

exports.eliminarAdministrador = async(req, res) => {
    try{
        let administrador = await Administrador.findById(req.params.id);
        if(!administrador){
            res.status(400).json({msg: "Este administrador no existe"});
        }
        await Administrador.findByIdAndDelete(req.params.id);
        res.json({msg: "Administrador eliminado"});
    }catch (error) {
        console.log("Error", error);
        res.status(500).send('Ocurrio Un Error ' + error);        
    }
}