const { body, validationResult } = require('express-validator');

// Middleware para manejar errores de validación
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      error: 'Datos de entrada inválidos',
      detalles: errors.array()
    });
  }
  next();
};

// Validaciones para registro de usuario
const validarRegistro = [
  body('nombre')
    .notEmpty().withMessage('El nombre es obligatorio')
    .isLength({ min: 2, max: 100 }).withMessage('El nombre debe tener entre 2 y 100 caracteres'),
  body('email')
    .isEmail().withMessage('Debe ser un email válido')
    .normalizeEmail(),
  body('password')
    .isLength({ min: 6 }).withMessage('La contraseña debe tener al menos 6 caracteres'),
  body('rol')
    .isIn(['admin', 'trabajador', 'ciudadano']).withMessage('Rol no válido'),
  handleValidationErrors
];

// Validaciones para login
const validarLogin = [
  body('email')
    .isEmail().withMessage('Debe ser un email válido')
    .normalizeEmail(),
  body('password')
    .notEmpty().withMessage('La contraseña es obligatoria'),
  handleValidationErrors
];

// Validaciones para reportes
const validarReporte = [
  body('titulo')
    .notEmpty().withMessage('El título es obligatorio')
    .isLength({ max: 200 }).withMessage('El título no puede exceder 200 caracteres'),
  body('categoria')
    .isIn(['bache', 'alumbrado', 'basura', 'fuga', 'vialidad', 'otros']).withMessage('Categoría no válida'),
  body('longitud')
    .isFloat({ min: -180, max: 180 }).withMessage('Longitud inválida'),
  body('latitud')
    .isFloat({ min: -90, max: 90 }).withMessage('Latitud inválida'),
  handleValidationErrors
];

// Validaciones para noticias
const validarNoticia = [
  body('titulo')
    .notEmpty().withMessage('El título es obligatorio')
    .isLength({ max: 200 }).withMessage('El título no puede exceder 200 caracteres'),
  body('contenido')
    .notEmpty().withMessage('El contenido es obligatorio'),
  body('urls_externas')
    .optional()
    .isArray().withMessage('URLs externas debe ser un array'),
  body('urls_externas.*')
    .optional()
    .isURL().withMessage('Cada URL externa debe ser válida'),
  handleValidationErrors
];

// Validaciones para correos
const validarCorreo = [
  body('destinatarios')
    .isArray({ min: 1 }).withMessage('Debe haber al menos un destinatario'),
  body('asunto')
    .notEmpty().withMessage('El asunto es obligatorio')
    .isLength({ max: 200 }).withMessage('El asunto no puede exceder 200 caracteres'),
  body('cuerpo')
    .notEmpty().withMessage('El cuerpo del mensaje es obligatorio'),
  handleValidationErrors
];

module.exports = {
  validarRegistro,
  validarLogin,
  validarReporte,
  validarNoticia,
  validarCorreo,
  handleValidationErrors
};