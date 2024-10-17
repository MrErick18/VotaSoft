const Voto = require('../models/Voto');
const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

const handleError = (res, error, message) => {
    console.error(message, error);
    res.status(500).json({ mensaje: message });
};

exports.obtenerResultadosPorEleccion = async (req, res) => {
    try {
        const { eleccionId } = req.params;
        const votos = await Voto.find({ Eleccion_id: eleccionId }).populate('Candidato_id', 'nombreCompleto');

        const resultados = votos.reduce((acc, voto) => {
            if (voto.Candidato_id === null) {
                acc['Voto en Blanco'] = (acc['Voto en Blanco'] || 0) + 1;
            } else {
                const candidatoNombre = voto.Candidato_id.nombreCompleto;
                acc[candidatoNombre] = (acc[candidatoNombre] || 0) + 1;
            }
            return acc;
        }, {});

        res.json(Object.entries(resultados).map(([nombre, votos]) => ({ nombre, votos })));
    } catch (error) {
        handleError(res, error, 'Error al obtener resultados');
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
            organizador,
            totalVotantes,
            abstencion
        } = req.body;
        const doc = new PDFDocument({
            size: 'A4',
            margins: { top: 50, bottom: 50, left: 72, right: 72 },
            bufferPages: true
        });

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=resultados_${eleccionNombre.replace(/\s+/g, '_')}.pdf`);

        doc.pipe(res);

        generarPortada(doc, eleccionNombre, fechaEleccion, lugarEleccion, organizador);
        generarInformacionGeneral(doc, resultados);
        generarResultadosPDF(doc, resultados, empate, empatados, ganador);
        generarGraficosPDF(doc, barChartImage, pieChartImage);
        generarFirmasPDF(doc);

        // Agregar números de página
        const range = doc.bufferedPageRange();
        for (let i = range.start; i < range.start + range.count; i++) {
            doc.switchToPage(i);
            doc.text(`Página ${i + 1} de ${range.count}`,
                doc.page.margins.left,
                doc.page.height - 50,
                { align: 'center', width: doc.page.width - doc.page.margins.left - doc.page.margins.right });
        }

        doc.end();
    } catch (error) {
        console.error('Error al generar PDF:', error);
        if (!res.headersSent) {
            res.status(500).json({ mensaje: 'Error al generar PDF' });
        }
    }
};
function generarPortada(doc, eleccionNombre, fechaEleccion, lugarEleccion, organizador) {
    // Fondo degradado
    const gradient = doc.linearGradient(0, 0, doc.page.width, doc.page.height);
    gradient.stop(0, '#4e54c8')
        .stop(1, '#8f94fb');
    doc.rect(0, 0, doc.page.width, doc.page.height).fill(gradient);
    doc.fontSize(36).font('Helvetica-Bold').fillColor('#FFFFFF')
        .text('ACTA OFICIAL DE ELECCIÓN', 0, doc.page.height / 4, { align: 'center' });

    doc.moveDown(2);
    doc.fontSize(28).font('Helvetica-Bold')
        .text(eleccionNombre.toUpperCase(), { align: 'center' });

    doc.moveDown(4);

    // Información de la elección
    const infoStyle = { align: 'center', width: 400, color: '#FFFFFF' };
    doc.fontSize(16).font('Helvetica')
        .text(`Fecha: ${new Date(fechaEleccion).toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' })}`, infoStyle);
    doc.moveDown(0.5);
    doc.text(`Lugar: ${lugarEleccion}`, infoStyle);
    doc.moveDown(0.5);
    doc.text(`Organizador: ${organizador}`, infoStyle);

    doc.moveDown(8);
    doc.fontSize(12).fillColor('#FFFFFF')
        .text('DOCUMENTO OFICIAL DE RESULTADOS ELECTORALES', { align: 'center', italics: true });

    // Agregar un diseño decorativo
    doc.circle(doc.page.width / 2, doc.page.height - 100, 50)
        .lineWidth(2)
        .stroke('#FFFFFF');

    doc.addPage();
}
function generarInformacionGeneral(doc, resultados) {
    agregarEncabezadoYPie(doc);
    doc.moveDown();
    doc.font('Helvetica-Bold').fontSize(24).fillColor('#333333')
        .text('1. INFORMACIÓN GENERAL', { align: 'left', underline: true });
    doc.moveDown();

    // Sección de estadísticas generales
    doc.font('Helvetica-Bold').fontSize(16).text('1.1 Estadísticas de Participación', { underline: true });
    doc.font('Helvetica').fontSize(14).fillColor('#444444');
    const votosEmitidos = resultados.reduce((sum, { votos }) => sum + votos, 0);
    const votosEnBlanco = resultados.find(r => r.nombre === 'Voto en Blanco')?.votos || 0;
    doc.text(`Votos emitidos: ${votosEmitidos}`);
    doc.text(`Votos en blanco: ${votosEnBlanco}`);
    doc.text(`Votos válidos: ${votosEmitidos - votosEnBlanco}`);

    doc.moveDown();

    doc.font('Helvetica-Bold').fontSize(16).text('1.2 Candidatos Participantes', { underline: true });
    doc.font('Helvetica').fontSize(14).fillColor('#444444');
    resultados.forEach(({ nombre }, index) => {
        if (nombre !== 'Voto en Blanco') {
            doc.text(`${index + 1}. ${nombre}`, { bulletRadius: 2, bulletIndent: 10 });
        }
    });
    doc.moveDown();

    doc.font('Helvetica-Bold').fontSize(16).fillColor('#333333')
        .text('1.3 Desarrollo de la Elección', { underline: true });
    doc.font('Helvetica').fontSize(14).fillColor('#444444')
        .text('La elección se llevó a cabo de acuerdo con los procedimientos establecidos en el reglamento electoral vigente. Se garantizó que todos los participantes tuvieran la oportunidad de emitir su voto de manera libre, secreta y democrática.', {
            align: 'justify',
            lineGap: 5
        });
    doc.moveDown(2);
}
function generarResultadosPDF(doc, resultados, empate, empatados, ganador) {
    doc.addPage();
    agregarEncabezadoYPie(doc);
    doc.moveDown();
    doc.font('Helvetica-Bold').fontSize(24).fillColor('#333333')
        .text('2. RESULTADOS DE LA ELECCIÓN', { align: 'left', underline: true });
    doc.moveDown();

    const tableTop = doc.y + 10;
    const colWidth = (doc.page.width - doc.page.margins.left - doc.page.margins.right) / 3;

    // Table header
    doc.font('Helvetica-Bold').fontSize(14).fillColor('#ffffff');
    doc.rect(doc.page.margins.left, tableTop, doc.page.width - doc.page.margins.left - doc.page.margins.right, 30)
        .fill('#4a4a4a');
    ['Candidato', 'Votos', 'Porcentaje'].forEach((text, i) => {
        doc.text(text, doc.page.margins.left + (i * colWidth) + 5, tableTop + 10, { width: colWidth - 10, align: 'left' });
    });

    // Table rows
    let rowTop = tableTop + 30;
    const totalVotos = resultados.reduce((sum, { votos }) => sum + votos, 0);

    resultados.forEach(({ nombre, votos }, i) => {
        const porcentaje = ((votos / totalVotos) * 100).toFixed(2) + '%';
        const rowHeight = 30;
        const fillColor = nombre === 'Voto en Blanco' ? '#e0e0e0' : (i % 2 ? '#f9f9f9' : '#ffffff');
        doc.rect(doc.page.margins.left, rowTop, doc.page.width - doc.page.margins.left - doc.page.margins.right, rowHeight)
            .fillAndStroke(fillColor, '#e0e0e0');

        doc.fillColor('#333333').font(nombre === 'Voto en Blanco' ? 'Helvetica-Bold' : 'Helvetica').fontSize(12);
        doc.text(nombre, doc.page.margins.left + 5, rowTop + 10, { width: colWidth - 10 });
        doc.text(votos.toString(), doc.page.margins.left + colWidth + 5, rowTop + 10, { width: colWidth - 10, align: 'center' });
        doc.text(porcentaje, doc.page.margins.left + (2 * colWidth) + 5, rowTop + 10, { width: colWidth - 10, align: 'right' });

        rowTop += rowHeight;
    });

    doc.moveDown(2);

    // Alinear a la izquierda
    const leftMargin = doc.page.margins.left;

    if (empate) {
        doc.font('Helvetica-Bold').fontSize(18).fillColor('#333333')
            .text('2.1 Resultado: Empate', leftMargin, doc.y, { underline: true, align: 'left' });
        doc.moveDown();
        doc.font('Helvetica').fontSize(14).fillColor('#444444')
            .text('Se ha producido un empate entre los siguientes candidatos:', leftMargin, doc.y, { align: 'left' });
        empatados.forEach(({ nombre, votos }) => {
            doc.moveDown(0.5);
            doc.text(`• ${nombre}: ${votos} votos`, leftMargin, doc.y, { bulletRadius: 2, bulletIndent: 10, align: 'left' });
        });
    } else if (ganador) {
        doc.font('Helvetica-Bold').fontSize(18).fillColor('#333333')
            .text('2.1 Ganador de la Elección', leftMargin, doc.y, { underline: true, align: 'left' });
        doc.moveDown();
        doc.font('Helvetica').fontSize(14).fillColor('#444444')
            .text(`De acuerdo con los resultados obtenidos, se declara como ganador(a) de la elección a ${ganador.nombre} con un total de ${ganador.votos} votos, lo que representa el ${((ganador.votos / totalVotos) * 100).toFixed(2)}% del total de votos emitidos.`, leftMargin, doc.y, { align: 'left' });
    }
    doc.moveDown(2);
}
function generarGraficosPDF(doc, barChartImage, pieChartImage) {
    // Página para el gráfico de barras
    doc.addPage();
    agregarEncabezadoYPie(doc);
    doc.moveDown();
    doc.font('Helvetica-Bold').fontSize(24).fillColor('#333333')
        .text('3. REPRESENTACIÓN GRÁFICA DE RESULTADOS', { align: 'left', underline: true });
    doc.moveDown();

    if (barChartImage && pieChartImage) {
        const pageWidth = doc.page.width - doc.page.margins.left - doc.page.margins.right;
        const pageHeight = doc.page.height - doc.page.margins.top - doc.page.margins.bottom;

        doc.font('Helvetica-Bold').fontSize(18).text('3.1 Gráfico de Barras', { align: 'left' });
        doc.image(Buffer.from(barChartImage.replace(/^data:image\/\w+;base64,/, ''), 'base64'), {
            fit: [pageWidth, pageHeight - 100],
            align: 'center'
        });

        // Nueva página para el gráfico circular
        doc.addPage();
        agregarEncabezadoYPie(doc);

        doc.font('Helvetica-Bold').fontSize(18).text('3.2 Gráfico Circular', { align: 'left' });
        doc.image(Buffer.from(pieChartImage.replace(/^data:image\/\w+;base64,/, ''), 'base64'), {
            fit: [pageWidth, pageHeight - 100],
            align: 'center'
        });
    } else {
        doc.font('Helvetica').fontSize(14).fillColor('#444444')
            .text('No se proporcionaron gráficos para esta elección.', { align: 'center' });
    }
}
function generarFirmasPDF(doc) {
    doc.addPage();
    agregarEncabezadoYPie(doc);
    doc.moveDown();
    doc.font('Helvetica-Bold').fontSize(24).fillColor('#333333')
        .text('4. VALIDACIÓN Y FIRMAS', { align: 'left', underline: true });
    doc.moveDown();

    doc.font('Helvetica').fontSize(14).fillColor('#444444')
        .text('Los siguientes participantes estuvieron presentes durante el conteo de votos y certifican la veracidad de los resultados presentados en este documento:', {
            align: 'justify',
            lineGap: 5
        });
    doc.moveDown();

    for (let i = 1; i <= 3; i++) {
        doc.text(`${i}. ________________________________`, { align: 'left' });
        doc.font('Helvetica-Oblique').text(`Nombre y firma del participante ${i}`, { align: 'left' });
        doc.moveDown();
    }

    doc.moveDown(2);
    doc.font('Helvetica-Bold').fontSize(18).fillColor('#333333')
        .text('5. DECLARACIÓN DE VALIDEZ', { underline: true });
    doc.font('Helvetica').fontSize(14).fillColor('#444444')
        .text('El presente documento se redacta y se firma en conformidad con los resultados obtenidos en el proceso electoral. Se certifica que la elección se llevó a cabo de manera transparente y democrática, y que los resultados aquí presentados son fiel reflejo de la voluntad expresada por los votantes.', {
            align: 'justify',
            lineGap: 5
        });
}
function agregarEncabezadoYPie(doc) {
    // Encabezado
    doc.fontSize(10).fillColor('#888888').text('ACTA OFICIAL DE ELECCIÓN', doc.page.margins.left, 20, {
        align: 'left',
        width: doc.page.width - doc.page.margins.left - doc.page.margins.right
    });
    doc.moveTo(doc.page.margins.left, 35)
        .lineTo(doc.page.width - doc.page.margins.right, 35)
        .stroke('#cccccc');

    // Pie de página
    doc.page.margins.bottom = 30;
    doc.page.margins.left = 50;
    doc.page.margins.right = 50;
}