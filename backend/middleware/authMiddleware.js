const jwt = require('jsonwebtoken');
const Usuario = require('../models/usuario');

// Verificar token JWT
const verificarToken = async (req, res, next) => {
  try {
    const authHeader = req.header('Authorization');
    console.log('--- DEBUG AUTH ---');
    console.log('Auth Header:', authHeader ? 'Presente' : 'Ausente');

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.log('Error: Token no proporcionado o formato incorrecto');
      return res.status(401).json({
        error: 'Acceso denegado. Token no proporcionado'
      });
    }

    const token = authHeader.replace('Bearer ', '');

    // Verificar token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('Token decodificado. ID Usuario:', decoded.id);

    // Buscar usuario en base de datos
    const usuario = await Usuario.buscarPorId(decoded.id);

    if (!usuario) {
      console.log('Error: Usuario del token no existe en DB');
      return res.status(401).json({
        error: 'Token inválido. Usuario no existe'
      });
    }

    console.log('Autenticación exitosa para:', usuario.email);
    console.log('--- END DEBUG ---');

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