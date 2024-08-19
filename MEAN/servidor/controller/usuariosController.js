const Usuarios = require("../models/Usuarios");

exports.crearUsuarios = async(req, res) => {
    try {
        let usuarios;
        usuarios = new Usuarios(req.body);
        await usuarios.save();
        res.send(usuarios)
    } catch(error){
        console.log(error);
        res.status(500).send('Ocurrio un Error')
    }
}

exports.obtenerUsuarios = async(req, res) =>{
    try{
        const usuarios = await Usuarios.find();
        res.json(usuarios)
    }catch(error){
        console.log(error);
        res.status(500).send('Ocurrio un error')
        
    }
}

exports.actualizarUsusarios = async(req, res) => {
    try {
        const { nombre, apellidos, tipoDoc, numDoc} = req.body;
        let usuarios = await Usuarios.findById(req.params.id);
        if (!usuarios) {return res.status(400).json({ msg: "Usuario No Existe" });}
        usuarios.nombre = nombre;
        usuarios.apellidos = apellidos;
        usuarios.tipoDoc = tipoDoc;
        usuarios.numDoc = numDoc;
        usuarios = await Usuarios.findByIdAndUpdate({ _id: req.params.id }, usuarios, { new: true }
        );
        res.json(usuarios);
    } catch (error) {
        console.log(error);
        res.status(500).send("Ocurrió un Error al Actualizar");
    }
}

exports.buscarUsuarios = async(req, res) => {
    try{
        let usuarios = await usuarios.findById(req.params.id);
        if(!usuarios){
            res.status(400).json({msg: 'Este Usuario no Existe'});
        }
        res.json(usuarios);
    }catch(error){ 
        console.log(error);        
        res.status(500).send('Ocurrio Un Error Al Eliminar Usuario')
    }
}

exports.eliminarUsuarios = async(req, res) => {
    try{
        let usuarios = await Usuarios.findById(req.params.id);
        if(!usuarios){
            res.status(400).json({msg: "Este Usuarios No Existe"});
        }
        await Usuairos.findByIdAndDelete(req.params.id);
        res.json({msg: "Usuarios Eliminado"});
    }catch (error) {
        console.log("Error", error);
        res.status(500).send('Ocurrio Un Error ' + error);        
    }
}
