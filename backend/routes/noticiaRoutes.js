const express = require('express');
const {
  crearNoticia,
  obtenerNoticias,
  obtenerNoticiaPorId,
  actualizarNoticia,
  eliminarNoticia
} = require('../controllers/noticiaController');
const { verificarToken, verificarPermisoNoticia } = require('../middleware/authMiddleware');
const { upload } = require('../middleware/uploadMiddleware');

const router = express.Router();

// Todas las rutas requieren autenticación
router.use(verificarToken);

// Rutas públicas (todos los usuarios autenticados pueden ver noticias)
router.get('/', obtenerNoticias);
router.get('/:id', obtenerNoticiaPorId);

// Rutas protegidas (solo administradores y comunicación social pueden crear, actualizar y eliminar)
router.post('/', verificarPermisoNoticia, upload.array('imagen', 1), crearNoticia);
router.put('/:id', verificarPermisoNoticia, actualizarNoticia);
router.delete('/:id', verificarPermisoNoticia, eliminarNoticia);

module.exports = router;