const express = require('express');
const {
  crearNoticia,
  obtenerNoticias,
  obtenerNoticiaPorId,
  actualizarNoticia,
  eliminarNoticia
} = require('../controllers/noticiaController');
const { verificarToken, verificarAdmin } = require('../middleware/authMiddleware');

const router = express.Router();

// Todas las rutas requieren autenticación
router.use(verificarToken);

// Rutas públicas (todos los usuarios autenticados pueden ver noticias)
router.get('/', obtenerNoticias);
router.get('/:id', obtenerNoticiaPorId);

// Rutas protegidas (solo administradores pueden crear, actualizar y eliminar)
router.post('/', verificarAdmin, crearNoticia);
router.put('/:id', verificarAdmin, actualizarNoticia);
router.delete('/:id', verificarAdmin, eliminarNoticia);

module.exports = router;