const express = require('express');
const { registrar, login, obtenerPerfil, registrarPublico } = require('../controllers/authController');
const { verificarToken } = require('../middleware/authMiddleware');

const router = express.Router();

// Public routes
router.post('/registrar', registrar); // Registro general (restringir en controller si es necesario, pero el user actual no tiene restriccion de admin)
router.post('/registrar-publico', registrarPublico); // Registro específico para ciudadanos (App Móvil)
router.post('/login', login);

// Protected routes
router.get('/perfil', verificarToken, obtenerPerfil);

module.exports = router;