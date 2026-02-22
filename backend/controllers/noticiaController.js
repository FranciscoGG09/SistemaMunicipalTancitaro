const Noticia = require('../models/noticia');
const { v4: uuidv4 } = require('uuid');
const { uploadToCloudinary } = require('../middleware/uploadMiddleware');

// Crear una nueva noticia
const crearNoticia = async (req, res) => {
  try {
    const { titulo, contenido, adjuntos, urls_externas, prioritaria } = req.body;

    // Validaciones
    if (!titulo || !contenido) {
      return res.status(400).json({
        error: 'Título y contenido son obligatorios'
      });
    }

    // Procesar imágenes si existen
    let adjuntosUrls = [];
    if (req.files && req.files.length > 0) {
      const uploadPromises = req.files.map(file => uploadToCloudinary(file.buffer, file.mimetype));
      const results = await Promise.all(uploadPromises);
      adjuntosUrls = results
        .map(result => result.secure_url)
        .filter(url => url !== null);
    }

    const noticiaData = {
      titulo,
      contenido,
      adjuntos: adjuntosUrls,
      urls_externas: urls_externas || [],
      prioritaria: prioritaria || false,
      usuario_id: req.usuario.id
    };

    const nuevaNoticia = await Noticia.crear(noticiaData);

    res.status(201).json({
      mensaje: 'Noticia creada exitosamente',
      noticia: nuevaNoticia
    });

  } catch (error) {
    console.error('Error creando noticia:', error);
    res.status(500).json({
      error: 'Error interno del servidor al crear noticia'
    });
  }
};

// Obtener todas las noticias
const obtenerNoticias = async (req, res) => {
  try {
    const { pagina, limite, prioritaria } = req.query;

    const noticias = await Noticia.obtenerTodas(
      parseInt(pagina) || 1,
      parseInt(limite) || 10,
      { prioritaria: prioritaria === 'true' }
    );

    res.json({
      noticias,
      pagina: parseInt(pagina) || 1,
      limite: parseInt(limite) || 10
    });

  } catch (error) {
    console.error('Error obteniendo noticias:', error);
    res.status(500).json({
      error: 'Error interno del servidor al obtener noticias'
    });
  }
};

// Obtener una noticia por ID
const obtenerNoticiaPorId = async (req, res) => {
  try {
    const { id } = req.params;
    const noticia = await Noticia.obtenerPorId(id);

    if (!noticia) {
      return res.status(404).json({
        error: 'Noticia no encontrada'
      });
    }

    res.json({
      noticia
    });

  } catch (error) {
    console.error('Error obteniendo noticia:', error);
    res.status(500).json({
      error: 'Error interno del servidor al obtener noticia'
    });
  }
};

// Actualizar noticia
const actualizarNoticia = async (req, res) => {
  try {
    const { id } = req.params;
    const { titulo, contenido, adjuntos, urls_externas, prioritaria } = req.body;

    const noticiaActualizada = await Noticia.actualizar(id, {
      titulo,
      contenido,
      adjuntos,
      urls_externas,
      prioritaria
    });

    res.json({
      mensaje: 'Noticia actualizada exitosamente',
      noticia: noticiaActualizada
    });

  } catch (error) {
    console.error('Error actualizando noticia:', error);
    res.status(500).json({
      error: 'Error interno del servidor al actualizar noticia'
    });
  }
};

// Eliminar noticia
const eliminarNoticia = async (req, res) => {
  try {
    const { id } = req.params;

    await Noticia.eliminar(id);

    res.json({
      mensaje: 'Noticia eliminada exitosamente'
    });

  } catch (error) {
    console.error('Error eliminando noticia:', error);
    res.status(500).json({
      error: 'Error interno del servidor al eliminar noticia'
    });
  }
};

module.exports = {
  crearNoticia,
  obtenerNoticias,
  obtenerNoticiaPorId,
  actualizarNoticia,
  eliminarNoticia
};