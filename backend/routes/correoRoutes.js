const express = require('express');
const {
  enviarCorreo,
  obtenerCorreos,
  obtenerCorreosEnviados,
  obtenerCorreoPorId,
  marcarComoLeido,
  eliminarCorreo
} = require('../controllers/correoController');
const { verificarToken } = require('../middleware/authMiddleware');
const { validarCorreo } = require('../middleware/validationMiddleware');

const router = express.Router();

// Todas las rutas requieren autenticación
router.use(verificarToken);

router.post('/', validarCorreo, enviarCorreo);
router.get('/', obtenerCorreos);
router.get('/enviados', obtenerCorreosEnviados);
router.get('/:id', obtenerCorreoPorId);
router.put('/:id/leer', marcarComoLeido);
router.delete('/:id', eliminarCorreo);

module.exports = router;