const express = require('express');
const {
  crearReporte,
  obtenerReportes,
  obtenerReportePorId,
  actualizarReporte,
  eliminarReporte,
  obtenerEstadisticas
} = require('../controllers/reporteController');
const { verificarToken, verificarTrabajador } = require('../middleware/authMiddleware');

const router = express.Router();

// Todas las rutas requieren autenticación
router.use(verificarToken);

// Rutas públicas para reportes (ciudadanos pueden crear y ver sus reportes)
router.post('/', crearReporte);
router.get('/', obtenerReportes);
router.get('/:id', obtenerReportePorId);

// Rutas protegidas (solo trabajadores y admin)
router.put('/:id', verificarTrabajador, actualizarReporte);
router.delete('/:id', verificarTrabajador, eliminarReporte);
router.get('/estadisticas/estadisticas', verificarTrabajador, obtenerEstadisticas);

module.exports = router;