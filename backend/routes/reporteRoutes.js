const express = require('express');
const {
  crearReporte,
  obtenerReportes,
  obtenerReportePorId,
  actualizarReporte,
  eliminarReporte,
  obtenerEstadisticas
} = require('../controllers/reporteController');
const { verificarToken, verificarTrabajador, verificarNoTrabajador, verificarAdmin } = require('../middleware/authMiddleware');

const router = express.Router();

// Todas las rutas requieren autenticación
router.use(verificarToken);

// Rutas públicas para reportes (ciudadanos y admin pueden crear, trabajadores NO)
const { upload } = require('../middleware/uploadMiddleware');

router.post('/', verificarNoTrabajador, upload.array('fotos', 5), crearReporte);
router.get('/', obtenerReportes);
router.get('/:id', obtenerReportePorId);

// Rutas protegidas (solo trabajadores y admin)
router.put('/:id', verificarTrabajador, actualizarReporte);
router.delete('/:id', verificarAdmin, eliminarReporte);
router.get('/estadisticas/estadisticas', obtenerEstadisticas);

module.exports = router;