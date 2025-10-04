const express = require('express');
const { registrar, login, obtenerPerfil } = require('../controllers/authController');
const { verificarToken } = require('../middleware/authMiddleware');

const router = express.Router();

// Public routes
router.post('/registrar', registrar);
router.post('/login', login);

// Protected routes
router.get('/perfil', verificarToken, obtenerPerfil);

module.exports = router;