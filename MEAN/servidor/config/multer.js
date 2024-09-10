const multer = require('multer');
const path = require('path');

// Configurar almacenamiento para los archivos subidos
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'subirArchivo/'); // Carpeta donde se guardarán los archivos subidos
  },
  filename: (req, file, cb) => {
    cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ storage: storage });

module.exports = upload;
