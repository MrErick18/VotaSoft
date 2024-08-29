const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: {
        user: "votasoftsoporte@gmail.com",
        pass: "gamh ewnb npvh snsk",
    },
});

transporter.verify().then(() => {
    console.log('Ready to send emails');
}).catch(error => {
    console.error('Error al verificar el transportador:', error);
});

module.exports = { transporter };