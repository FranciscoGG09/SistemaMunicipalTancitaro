const express = require('express');
const { verificarToken } = require('../middleware/authMiddleware');

const router = express.Router();

// Por ahora solo el router básico
router.use(verificarToken);

module.exports = router;