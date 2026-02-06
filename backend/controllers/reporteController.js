const Reporte = require('../models/reporte');
const { v4: uuidv4 } = require('uuid');

// Crear un nuevo reporte
const { uploadToCloudinary } = require('../middleware/uploadMiddleware');

const crearReporte = async (req, res) => {
  try {
    const { titulo, descripcion, categoria, longitud, latitud, dispositivo_origen } = req.body;

    // Validaciones
    if (!titulo || !categoria) {
      return res.status(400).json({
        error: 'Título y categoría son obligatorios'
      });
    }

    // Procesar imágenes si existen
    let fotosUrls = [];
    if (req.files && req.files.length > 0) {
      const uploadPromises = req.files.map(file => uploadToCloudinary(file.buffer));
      const results = await Promise.all(uploadPromises);
      fotosUrls = results.map(result => result.secure_url);
    }

    const reporteData = {
      id: uuidv4(),
      usuario_id: req.usuario.id,
      titulo,
      descripcion,
      categoria,
      longitud,
      latitud,
      fotos: fotosUrls,
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

// Obtener todos los reportes (con filtros por rol)
const obtenerReportes = async (req, res) => {
  try {
    const { pagina, limite, categoria, estado } = req.query;

    // Verificar si req.usuario existe (middleware de auth)
    if (!req.usuario) {
      return res.status(401).json({ error: 'Usuario no autenticado' });
    }

    const { rol, id: usuarioId, departamento } = req.usuario;

    let filtros = { categoria, estado };

    // Filtros basados en Rol
    if (rol === 'ciudadano') {
      // Ciudadanos solo ven sus propios reportes
      filtros.usuario_id = usuarioId;
    } else if (rol === 'trabajador') {
      // Trabajadores solo ven reportes de su categoría/departamento
      if (!departamento) {
        // Si es trabajador pero no tiene depto, limitar acceso
        filtros.categoria = 'SIN_DEPARTAMENTO';
      } else {
        filtros.categoria = departamento;
      }
    }
    // Admin y ComSoc ven todo

    const reportes = await Reporte.obtenerTodos(
      parseInt(pagina) || 1,
      parseInt(limite) || 10,
      filtros
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
    const { rol, id: usuarioId, departamento } = req.usuario;

    const reporte = await Reporte.obtenerPorId(id);

    if (!reporte) {
      return res.status(404).json({
        error: 'Reporte no encontrado'
      });
    }

    // Verificar permiso de lectura individual
    if (rol === 'ciudadano' && reporte.usuario_id !== usuarioId) {
      return res.status(403).json({ error: 'No tienes permiso para ver este reporte' });
    }
    if (rol === 'trabajador' && reporte.categoria !== departamento) {
      // Opcional: permitir ver si está asignado explícitamente, pero por ahora por departamento
      return res.status(403).json({ error: 'No tienes permiso para ver este reporte' });
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

// Actualizar reporte (Estado y Notas)
const actualizarReporte = async (req, res) => {
  try {
    const { id } = req.params;
    const { estado, notas } = req.body;

    if (!req.usuario) return res.status(401).json({ error: 'No autenticado' });
    const { rol, id: usuarioId } = req.usuario;

    // Verificar permisos: Solo admin y trabajador pueden actualizar estado
    if (!['admin', 'trabajador'].includes(rol)) {
      return res.status(403).json({ error: 'No tienes permiso para actualizar reportes' });
    }

    const reporteActual = await Reporte.obtenerPorId(id);
    if (!reporteActual) {
      return res.status(404).json({ error: 'Reporte no encontrado' });
    }

    // Validar flujo de estados
    if (reporteActual.estado === 'concluido' && rol !== 'admin') {
      return res.status(400).json({ error: 'No se puede modificar un reporte concluido' });
    }

    // Preparar datos de actualización
    const datosActualizar = {
      estado,
      notas,
      usuario_actualizador_id: usuarioId
    };

    const reporteActualizado = await Reporte.actualizar(id, datosActualizar);

    res.json({
      mensaje: 'Reporte actualizado exitosamente',
      reporte: reporteActualizado
    });

  } catch (error) {
    console.error('Error actualizando reporte:', error);
    res.status(500).json({
      error: 'Error interno del servidor al actualizar reporte'
    });
  }
};

const eliminarReporte = async (req, res) => {
  res.json({ mensaje: 'Eliminar reporte - pendiente' });
};

const obtenerEstadisticas = async (req, res) => {
  try {
    const { rol, id: usuarioId, departamento } = req.usuario;
    let filtros = {};

    if (rol === 'ciudadano') {
      filtros.usuario_id = usuarioId;
    } else if (rol === 'trabajador') {
      if (departamento) {
        filtros.categoria = departamento;
      } else {
        // Si no tiene depto asignado, quizás no debería ver nada o ver todo? 
        // Asumiremos que ve 'SIN_DEPARTAMENTO' o similar, igual que en obtenerReportes
        filtros.categoria = 'SIN_DEPARTAMENTO';
      }
    }
    // Admin ve todo (filtros vacíos)

    const stats = await Reporte.obtenerEstadisticas(filtros);
    res.json({ estadisticas: stats });
  } catch (error) {
    console.error('Error stats:', error);
    res.status(500).json({ error: 'Error interno' });
  }
};

module.exports = {
  crearReporte,
  obtenerReportes,
  obtenerReportePorId,
  actualizarReporte,
  eliminarReporte,
  obtenerEstadisticas
};