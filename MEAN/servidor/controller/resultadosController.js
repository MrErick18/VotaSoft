const Voto = require('../models/Voto');
const Eleccion = require('../models/Eleccion');
const Candidato = require('../models/Candidato');
const PDFDocument = require('pdfkit');

exports.obtenerResultadosPorEleccion = async (req, res) => {
    try {
        const { eleccionId } = req.params;
        const votos = await Voto.find({ Eleccion_id: eleccionId }).populate('Candidato_id', 'nombreCompleto');
        
        const resultados = votos.reduce((acc, voto) => {
            const candidatoNombre = voto.Candidato_id.nombreCompleto;
            acc[candidatoNombre] = (acc[candidatoNombre] || 0) + 1;
            return acc;
        }, {});

        res.json(Object.entries(resultados).map(([nombre, votos]) => ({ nombre, votos })));
    } catch (error) {
        console.error('Error al obtener resultados:', error);
        res.status(500).json({ mensaje: 'Error al obtener resultados' });
    }
};

exports.generarPDF = async (req, res) => {
    try {
        const { eleccionId } = req.params;
        const { 
            eleccionNombre, 
            resultados, 
            ganador, 
            empate, 
            empatados, 
            barChartImage, 
            pieChartImage,
            fechaEleccion,
            lugarEleccion,
            organizador
        } = req.body;

        const doc = new PDFDocument();
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=resultados_${eleccionId}.pdf`);
        
        doc.pipe(res);

        // Título
        doc.fontSize(18).text(`Acta de Elección de ${eleccionNombre}`, { align: 'center' });
        doc.moveDown();

        // Fecha y Lugar
        doc.fontSize(14).text('Fecha y Lugar', { underline: true });
        doc.fontSize(12).text(`Fecha: ${fechaEleccion}`);
        doc.text(`Lugar: ${lugarEleccion}`);
        doc.moveDown();

        // Participantes
        doc.fontSize(14).text('Participantes', { underline: true });
        doc.fontSize(12).text(`Nombre del Organizador: ${organizador}`);
        doc.text('Candidatos:');
        resultados.forEach(({ nombre }) => {
            doc.text(`- ${nombre}`);
        });
        doc.moveDown();

        // Desarrollo de la Elección
        doc.fontSize(14).text('Desarrollo de la Elección', { underline: true });
        doc.fontSize(12).text('La elección se llevó a cabo conforme a los procedimientos establecidos. Los participantes tuvieron la oportunidad de emitir su voto de manera libre y secreta.');
        doc.moveDown();

        // Resultados
        doc.fontSize(14).text('Resultados', { underline: true });
        resultados.forEach(({ nombre, votos }) => {
            doc.fontSize(12).text(`${nombre}: ${votos} votos`);
        });
        doc.moveDown();

        // Ganador o empate
        if (empate) {
            doc.fontSize(14).text('Empate', { underline: true });
            doc.fontSize(12).text('Hay un empate entre los siguientes candidatos:');
            empatados.forEach(({ nombre, votos }) => {
                doc.text(`${nombre}: ${votos} votos`);
            });
        } else if (ganador) {
            doc.fontSize(14).text('Ganador', { underline: true });
            doc.fontSize(12).text(`Se declara como ganador(a) de la elección a ${ganador.nombre} con un total de ${ganador.votos} votos.`);
        }
        doc.moveDown();

        // Gráficos de Resultados
        doc.fontSize(14).text('Gráficos de Resultados', { underline: true });
        doc.fontSize(12).text('Se anexan los siguientes gráficos que muestran de manera visual los resultados de la elección:');

        // Gráfico de barras
        if (barChartImage) {
            doc.addPage();
            doc.fontSize(16).text('Gráfico de Barras', { align: 'center' });
            doc.image(Buffer.from(barChartImage.split(',')[1], 'base64'), {
                fit: [500, 400],
                align: 'center',
                valign: 'center'
            });
        }

        // Gráfico circular
        if (pieChartImage) {
            doc.addPage();
            doc.fontSize(16).text('Gráfico Circular', { align: 'center' });
            doc.image(Buffer.from(pieChartImage.split(',')[1], 'base64'), {
                fit: [500, 400],
                align: 'center',
                valign: 'center'
            });
        }

        // Firma de los Participantes
        doc.addPage();
        doc.fontSize(14).text('Firma de los Participantes', { underline: true });
        doc.fontSize(12).text('Los participantes que estuvieron presentes en el conteo de votos y certifican la veracidad de los resultados son los siguientes:');
        doc.moveDown();
        for (let i = 1; i <= 3; i++) {
            doc.text(`${i}. ______________________________ [Nombre y firma del participante ${i}]`);
            doc.moveDown();
        }

        // Validación
        doc.fontSize(14).text('Validación', { underline: true });
        doc.fontSize(12).text('El presente acta se redacta y se firma en conformidad con los resultados obtenidos y se archiva para futuras referencias.');

        doc.end();
    } catch (error) {
        console.error('Error al generar PDF:', error);
        res.status(500).json({ mensaje: 'Error al generar PDF' });
    }
};