const express = require('express');
const {
    registrar,
    login,
    obtenerPerfil,
    registrarPublico,
    obtenerUsuarios,
    actualizarUsuario,
    eliminarUsuario
} = require('../controllers/authController');
const { verificarToken, verificarAdmin } = require('../middleware/authMiddleware');

const router = express.Router();

// Public routes
router.post('/registrar', registrar);
router.post('/registrar-publico', registrarPublico);
router.post('/login', login);

// Protected routes
router.get('/perfil', verificarToken, obtenerPerfil);

// Admin Routes (Gestión de Usuarios)
router.get('/usuarios', verificarToken, verificarAdmin, obtenerUsuarios);
router.put('/usuarios/:id', verificarToken, verificarAdmin, actualizarUsuario);
router.delete('/usuarios/:id', verificarToken, verificarAdmin, eliminarUsuario);

module.exports = router;