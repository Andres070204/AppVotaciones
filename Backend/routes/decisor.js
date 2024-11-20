const express = require('express');
const router = express.Router();
const Propuesta = require('../models/Propuesta');
const Voto = require('../models/Voto');
const { Sequelize } = require('sequelize');
const PDFDocument = require('pdfkit');
const ExcelJS = require('exceljs');
const { ChartJSNodeCanvas } = require("chartjs-node-canvas");

// Mapa de localidades
const localidadMap = {
 "4.58917,-74.12817": "Antonio Nariño",
  "4.66558,-74.07787": "Barrios Unidos",
  "4.62881,-74.18548": "Bosa",
  "4.65451,-74.05894": "Chapinero",
  "4.54297,-74.15403": "Ciudad Bolívar",
  "4.6838,-74.111": "Engativá",
  "4.67833,-74.13978": "Fontibón",
  "4.6261,-74.14889": "Kennedy",
  "4.59575,-74.07458": "La Candelaria",
  "4.61607,-74.08665": "Los Mártires",
  "4.62788,-74.10395": "Puente Aranda",
  "4.56589,-74.10793": "Rafael Uribe Uribe",
  "4.56309,-74.0908": "San Cristóbal",
  "4.60622,-74.07039": "Santa Fe",
  "4.75591,-74.09016": "Suba",
  "4.1461,-74.26986": "Sumapaz",
  "4.64263,-74.09339": "Teusaquillo",
  "4.58249,-74.12377": "Tunjuelito",
  "4.71491,-74.03291": "Usaquén",
  "4.50482,-74.10858": "Usme"
  
};

// Ruta para obtener propuestas y votos por localidad
router.get('/propuestas', async (req, res) => {
  const { localidad } = req.query;

  const where = {};
  if (localidad) {
    where.localidad = localidad;
  }

  try {
    const propuestas = await Propuesta.findAll({
      where,
      include: [
        {
          model: Voto,
          attributes: ['tipoVoto'],
        },
      ],
    });
    res.status(200).json(propuestas);
  } catch (error) {
    console.error('Error al obtener propuestas:', error);
    res.status(500).json({ message: 'Error al obtener propuestas.' });
  }
});

// Ruta para generar reportes en PDF
router.get('/reportes/pdf', async (req, res) => {
    const { propuestaId } = req.query;
  
    if (!propuestaId) {
      return res.status(400).json({ error: "PropuestaId es requerido" });
    }
  
    const PDFDocument = require('pdfkit');
    const { ChartJSNodeCanvas } = require('chartjs-node-canvas');
  
    const width = 800; // Anchura del gráfico
    const height = 600; // Altura del gráfico
    const chartJSNodeCanvas = new ChartJSNodeCanvas({ width, height });
  
    try {
      const propuesta = await Propuesta.findOne({
        where: { id: propuestaId },
        include: [{ model: Voto }],
      });
  
      if (!propuesta) {
        return res.status(404).json({ error: "Propuesta no encontrada" });
      }
      const localidadNombre = localidadMap[propuesta.localidad] || propuesta.localidad;
      const votosAFavor = propuesta.Votos.filter((v) => v.tipoVoto === "favor").length;
      const votosEnContra = propuesta.Votos.filter((v) => v.tipoVoto === "contra").length;
  
      // Crear gráfico
      const configuration = {
        type: 'bar',
        data: {
          labels: ['Votos a Favor', 'Votos en Contra'],
          datasets: [{
            label: 'Votos',
            data: [votosAFavor, votosEnContra],
            backgroundColor: ['#4CAF50', '#F44336'],
          }],
        },
        options: {
          responsive: true,
          plugins: {
            legend: {
              display: true,
            },
          },
        },
      };
  
      const chartImage = await chartJSNodeCanvas.renderToBuffer(configuration);
  
      // Crear PDF
      const doc = new PDFDocument();
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename=Reporte_Propuesta_${propuestaId}.pdf`);
      doc.pipe(res);
  
      doc.fontSize(18).text('Reporte de Propuesta', { align: 'center' });
      doc
        .fontSize(12)
        .text(`Título: ${propuesta.titulo}`)
        .text(`Descripción: ${propuesta.descripcion}`)
        .text(`Localidad: ${localidadNombre}`)
        .text(`Presupuesto: ${propuesta.presupuesto}`)
        .text(`Votos a Favor: ${votosAFavor}`)
        .text(`Votos en Contra: ${votosEnContra}`)
        .moveDown();
  
      // Agregar el gráfico al PDF
      doc.image(chartImage, {
        fit: [500, 300], // Ajusta el tamaño del gráfico
        align: 'center',
        valign: 'center',
      });
  
      doc.end();
    } catch (error) {
      console.error('Error al generar PDF:', error);
      res.status(500).send('Error al generar PDF.');
    }
  });
  router.get('/reportes/excel', async (req, res) => {
    const { propuestaId } = req.query;
  
    if (!propuestaId) {
      return res.status(400).json({ error: "PropuestaId es requerido" });
    }
  
    const ExcelJS = require('exceljs');
    const { ChartJSNodeCanvas } = require('chartjs-node-canvas');
  
    const width = 800; // Anchura del gráfico
    const height = 600; // Altura del gráfico
    const chartJSNodeCanvas = new ChartJSNodeCanvas({ width, height });
  
    try {
      const propuesta = await Propuesta.findOne({
        where: { id: propuestaId },
        include: [{ model: Voto }],
      });
  
      if (!propuesta) {
        return res.status(404).json({ error: "Propuesta no encontrada" });
      }
  
      const votosAFavor = propuesta.Votos.filter((v) => v.tipoVoto === "favor").length;
      const votosEnContra = propuesta.Votos.filter((v) => v.tipoVoto === "contra").length;
  
      // Crear gráfico
      const configuration = {
        type: 'bar',
        data: {
          labels: ['Votos a Favor', 'Votos en Contra'],
          datasets: [{
            label: 'Votos',
            data: [votosAFavor, votosEnContra],
            backgroundColor: ['#4CAF50', '#F44336'],
          }],
        },
      };
  
      const chartImage = await chartJSNodeCanvas.renderToBuffer(configuration);
  
      // Crear archivo Excel
      const workbook = new ExcelJS.Workbook();
      const sheet = workbook.addWorksheet('Reporte Propuesta');
  
      // Agregar datos de la propuesta
      sheet.addRow(['Título', propuesta.titulo]);
      sheet.addRow(['Descripción', propuesta.descripcion]);
      sheet.addRow(['Localidad', localidadMap[propuesta.localidad] || propuesta.localidad]);
      sheet.addRow(['Presupuesto', propuesta.presupuesto]);
      sheet.addRow([]);
      sheet.addRow(['Votos a Favor', votosAFavor]);
      sheet.addRow(['Votos en Contra', votosEnContra]);
  
      // Insertar gráfico como imagen
      const imageId = workbook.addImage({
        buffer: chartImage,
        extension: 'png',
      });
  
      sheet.addImage(imageId, 'A10:D20'); // Ajusta las coordenadas de celda para el gráfico
  
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', `attachment; filename=Reporte_Propuesta_${propuestaId}.xlsx`);
      await workbook.xlsx.write(res);
      res.end();
    } catch (error) {
      console.error('Error al generar Excel:', error);
      res.status(500).send('Error al generar Excel.');
    }
  });
    
  router.put('/editar-perfil', authorizeRole('decisor'), async (req, res) => {
    try {
      const { email, currentPassword, newPassword } = req.body;
      const identificacion = req.user.identificacion;
  
      // Buscar usuario
      const usuario = await User.findOne({ where: { identificacion } });
      if (!usuario) {
        return res.status(404).json({ message: 'Usuario no encontrado.' });
      }
  
      // Verificar contraseña actual
      const isPasswordValid = await bcrypt.compare(currentPassword, usuario.password);
      if (!isPasswordValid) {
        return res.status(400).json({ message: 'Contraseña actual incorrecta.' });
      }
  
      // Actualizar correo y/o contraseña
      if (email) usuario.email = email;
      if (newPassword) {
        const salt = await bcrypt.genSalt(10);
        usuario.password = await bcrypt.hash(newPassword, salt);
      }
  
      await usuario.save();
      res.status(200).json({ message: 'Perfil actualizado correctamente.' });
    } catch (error) {
      console.error('Error en el backend:', error);
      res.status(500).json({ message: 'Error interno del servidor.' });
    }
  });
  
module.exports = router;
