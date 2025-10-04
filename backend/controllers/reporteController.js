const Reporte = require('../models/reporte');
const { v4: uuidv4 } = require('uuid');

// Crear un nuevo reporte
const crearReporte = async (req, res) => {
  try {
    const { titulo, descripcion, categoria, longitud, latitud, fotos, dispositivo_origen } = req.body;

    // Validaciones
    if (!titulo || !categoria) {
      return res.status(400).json({
        error: 'Título y categoría son obligatorios'
      });
    }

    const reporteData = {
      id: uuidv4(),
      usuario_id: req.usuario.id,
      titulo,
      descripcion,
      categoria,
      longitud,
      latitud,
      fotos: fotos || [],
      dispositivo_origen: dispositivo_origen || 'web'
    };

    const nuevoReporte = await Reporte.crear(reporteData);

    res.status(201).json({
      mensaje: 'Reporte creado exitosamente',
      reporte: nuevoReporte
    });

  } catch (error) {
    console.error('Error creando reporte:', error);
    res.status(500).json({
      error: 'Error interno del servidor al crear reporte'
    });
  }
};

// Obtener todos los reportes
const obtenerReportes = async (req, res) => {
  try {
    const { pagina, limite, categoria, estado } = req.query;

    const reportes = await Reporte.obtenerTodos(
      parseInt(pagina) || 1,
      parseInt(limite) || 10,
      { categoria, estado }
    );

    res.json({
      reportes,
      pagina: parseInt(pagina) || 1,
      limite: parseInt(limite) || 10
    });

  } catch (error) {
    console.error('Error obteniendo reportes:', error);
    res.status(500).json({
      error: 'Error interno del servidor al obtener reportes'
    });
  }
};

// Obtener un reporte por ID
const obtenerReportePorId = async (req, res) => {
  try {
    const { id } = req.params;
    const reporte = await Reporte.obtenerPorId(id);

    if (!reporte) {
      return res.status(404).json({
        error: 'Reporte no encontrado'
      });
    }

    res.json({
      reporte
    });

  } catch (error) {
    console.error('Error obteniendo reporte:', error);
    res.status(500).json({
      error: 'Error interno del servidor al obtener reporte'
    });
  }
};

// Métodos placeholder para completar el router
const actualizarReporte = async (req, res) => {
  res.json({ mensaje: 'Actualizar reporte - pendiente' });
};

const eliminarReporte = async (req, res) => {
  res.json({ mensaje: 'Eliminar reporte - pendiente' });
};

const obtenerEstadisticas = async (req, res) => {
  res.json({ mensaje: 'Estadísticas - pendiente' });
};

module.exports = {
  crearReporte,
  obtenerReportes,
  obtenerReportePorId,
  actualizarReporte,
  eliminarReporte,
  obtenerEstadisticas
};