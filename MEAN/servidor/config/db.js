const mongoose = require('mongoose');
require('dotenv').config({path: 'variables.env'});

const conectarDB = async() =>{
    try {
        await mongoose.connect(process.env.DB_MONGO);
        console.log('Conectado a la base de datos');
    } catch (error) {
        console.log(error);
        process.exit(1);        
    }
}

module.exports = conectarDB