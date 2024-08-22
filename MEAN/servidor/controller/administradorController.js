const Administrador = require("../models/Administrador");
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

exports.crearAdministrador = async (req, res) => {
    try {
        const existeAdministrador = await Administrador.findOne({ numDoc: req.body.numDoc });
        if (existeAdministrador) {
            return res.status(400).json({ msg: "El número de documento ya está en uso" });
        }

        let administrador;
        req.body.contrasena = bcrypt.hashSync(req.body.contrasena, 12);
        administrador = new Administrador(req.body);
        await administrador.save();
        res.send(administrador);
    } catch (error) {
        console.log(error);
        res.status(500).send('Ocurrió un Error');
    }
};

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

exports.loginAdministrador = async(req, res) => {
    try {
        let  administrador = await Administrador.findOne({numDoc: req.body.numDoc});
        if(!administrador){
            res.status(400).json({msg: "Error en usuario/contraseña"});
        }
        const eq = bcrypt.compareSync(req.body.contrasena, administrador.contrasena);
        if(!eq){
            res.status(400).json({msg: "Error en usuario/contraseña"})
        }
        res.json({msg: "Login Correcto" , token: createToken(administrador)});
    } catch (error) {
        console.log("Error", error);
        res.status(500).send('Ocurrio Un Error ' + error);    
    }
}

function createToken(administrador){
    const payload = {
        administrador_id : administrador._id,
        numDoc: administrador.numDoc
    }
    return jwt.sign(payload, "porque si")
}

exports.verificarNumeroDocumento = async (req, res) => {
    try {
        const numDoc = req.params.numDoc;
        const administrador = await Administrador.findOne({ numDoc: numDoc });
        res.json(!!administrador); // Devuelve true si existe, false si no
    } catch (error) {
        console.log(error);
        res.status(500).send('Ocurrió un error al verificar el número de documento');
    }
}