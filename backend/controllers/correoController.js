const Correo = require('../models/correo');
const { v4: uuidv4 } = require('uuid');

// Enviar nuevo correo
const enviarCorreo = async (req, res) => {
  try {
    const { destinatarios, asunto, cuerpo, adjuntos } = req.body;

    const correoData = {
      remitente_id: req.usuario.id,
      destinatarios,
      asunto,
      cuerpo,
      adjuntos: adjuntos || []
    };

    const nuevoCorreo = await Correo.crear(correoData);

    res.status(201).json({
      mensaje: 'Correo enviado exitosamente',
      correo: nuevoCorreo
    });

  } catch (error) {
    console.error('Error enviando correo:', error);
    res.status(500).json({
      error: 'Error interno del servidor al enviar correo'
    });
  }
};

// Obtener correos del usuario (bandeja de entrada)
const obtenerCorreos = async (req, res) => {
  try {
    const { pagina, limite } = req.query;

    const correos = await Correo.obtenerPorDestinatario(
      req.usuario.id,
      parseInt(pagina) || 1,
      parseInt(limite) || 10
    );

    const estadisticas = await Correo.obtenerEstadisticas(req.usuario.id);

    res.json({
      correos,
      estadisticas,
      pagina: parseInt(pagina) || 1,
      limite: parseInt(limite) || 10
    });

  } catch (error) {
    console.error('Error obteniendo correos:', error);
    res.status(500).json({
      error: 'Error interno del servidor al obtener correos'
    });
  }
};

// Obtener correos enviados por el usuario
const obtenerCorreosEnviados = async (req, res) => {
  try {
    const { pagina, limite } = req.query;

    const correos = await Correo.obtenerPorRemitente(
      req.usuario.id,
      parseInt(pagina) || 1,
      parseInt(limite) || 10
    );

    res.json({
      correos,
      pagina: parseInt(pagina) || 1,
      limite: parseInt(limite) || 10
    });

  } catch (error) {
    console.error('Error obteniendo correos enviados:', error);
    res.status(500).json({
      error: 'Error interno del servidor al obtener correos enviados'
    });
  }
};

// Obtener correo por ID
const obtenerCorreoPorId = async (req, res) => {
  try {
    const { id } = req.params;
    const correo = await Correo.obtenerPorId(id);

    if (!correo) {
      return res.status(404).json({
        error: 'Correo no encontrado'
      });
    }

    // Verificar que el usuario tenga acceso al correo
    const tieneAcceso = correo.remitente_id === req.usuario.id || 
                       correo.destinatarios.includes(req.usuario.id);

    if (!tieneAcceso) {
      return res.status(403).json({
        error: 'No tienes permiso para ver este correo'
      });
    }

    // Marcar como leído si es destinatario
    if (correo.destinatarios.includes(req.usuario.id) && !correo.leido) {
      await Correo.marcarComoLeido(id);
    }

    res.json({
      correo
    });

  } catch (error) {
    console.error('Error obteniendo correo:', error);
    res.status(500).json({
      error: 'Error interno del servidor al obtener correo'
    });
  }
};

// Marcar correo como leído
const marcarComoLeido = async (req, res) => {
  try {
    const { id } = req.params;

    const correo = await Correo.marcarComoLeido(id);

    res.json({
      mensaje: 'Correo marcado como leído',
      correo
    });

  } catch (error) {
    console.error('Error marcando correo como leído:', error);
    res.status(500).json({
      error: 'Error interno del servidor al marcar correo como leído'
    });
  }
};

// Eliminar correo
const eliminarCorreo = async (req, res) => {
  try {
    const { id } = req.params;

    const correoEliminado = await Correo.eliminar(id);

    res.json({
      mensaje: 'Correo eliminado exitosamente',
      correo: correoEliminado
    });

  } catch (error) {
    console.error('Error eliminando correo:', error);
    res.status(500).json({
      error: 'Error interno del servidor al eliminar correo'
    });
  }
};

module.exports = {
  enviarCorreo,
  obtenerCorreos,
  obtenerCorreosEnviados,
  obtenerCorreoPorId,
  marcarComoLeido,
  eliminarCorreo
};