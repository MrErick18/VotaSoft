const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true, // Use `true` for port 465, `false` for all other ports
    auth: {
        user: "votasoftsoporte@gmail.com",
        pass: "gamh ewnb npvh snsk",
    },
});

transporter.verify().then(() => {
    console.log('Ready for send emails');
    }).catch(error => {
    console.error('Error al verificar el transportador:', error);
    // Detener la ejecución de la aplicación o tomar alguna acción correctiva
});

module.exports = { transporter };