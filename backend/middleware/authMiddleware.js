const jwt = require('jsonwebtoken');
const Usuario = require('../models/usuario');

// Verificar token JWT
const verificarToken = async (req, res, next) => {
  try {
    const authHeader = req.header('Authorization');

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        error: 'Acceso denegado. Token no proporcionado'
      });
    }

    const token = authHeader.replace('Bearer ', '');

    // Verificar token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Buscar usuario en base de datos
    const usuario = await Usuario.buscarPorId(decoded.id);

    if (!usuario) {
      return res.status(401).json({
        error: 'Token inválido. Usuario no existe'
      });
    }

    // Agregar usuario al request
    req.usuario = usuario;
    next();

  } catch (error) {
    return res.status(401).json({
      error: 'Token inválido o expirado'
    });
  }
};

// Verificar rol de administrador
const verificarAdmin = (req, res, next) => {
  if (req.usuario.rol !== 'admin') {
    return res.status(403).json({
      error: 'Acceso denegado. Se requiere rol de administrador'
    });
  }
  next();
};

// Verificar rol de trabajador o admin
const verificarTrabajador = (req, res, next) => {
  if (!['admin', 'trabajador'].includes(req.usuario.rol)) {
    return res.status(403).json({
      error: 'Acceso denegado. Se requiere rol de trabajador o administrador'
    });
  }
  next();
};

// Verificar permisos para noticias (Admin o Comunicación Social)
const verificarPermisoNoticia = (req, res, next) => {
  if (!['admin', 'comunicacion_social'].includes(req.usuario.rol)) {
    return res.status(403).json({
      error: 'Acceso denegado. Se requiere rol de administrador o comunicación social'
    });
  }
  next();
};

// Verificar que NO sea trabajador (para creación de reportes: solo admin y ciudadano)
const verificarNoTrabajador = (req, res, next) => {
  if (req.usuario.rol === 'trabajador') {
    return res.status(403).json({
      error: 'Los trabajadores no pueden crear reportes'
    });
  }
  next();
};

module.exports = {
  verificarToken,
  verificarAdmin,
  verificarTrabajador,
  verificarPermisoNoticia,
  verificarNoTrabajador
};