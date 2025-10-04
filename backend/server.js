const express = require('express');
const cors = require('cors');
require('dotenv').config();

const { testConnection } = require('./config/database');

// Importar rutas
const authRoutes = require('./routes/authRoutes');
const reporteRoutes = require('./routes/reporteRoutes');
const noticiaRoutes = require('./routes/noticiaRoutes');
const correoRoutes = require('./routes/correoRoutes');

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Logging de requests
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Rutas
app.use('/api/auth', authRoutes);
app.use('/api/reportes', reporteRoutes);
app.use('/api/noticias', noticiaRoutes);
app.use('/api/correos', correoRoutes);

// Ruta de salud
app.get('/api/salud', (req, res) => {
  res.json({
    mensaje: '✅ Backend Municipal Tancítaro funcionando correctamente',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// Manejo de rutas no encontradas - CORREGIDO
app.use((req, res) => {
  res.status(404).json({
    error: 'Ruta no encontrada',
    path: req.originalUrl,
    method: req.method
  });
});

// Manejo global de errores
app.use((error, req, res, next) => {
  console.error('Error global:', error);
  res.status(500).json({
    error: 'Error interno del servidor',
    detalles: process.env.NODE_ENV === 'development' ? error.message : undefined
  });
});

// Inicializar servidor
const iniciarServidor = async () => {
  try {
    // Probar conexión a la base de datos
    const dbConectada = await testConnection();
    if (!dbConectada) {
      throw new Error('No se pudo conectar a la base de datos');
    }

    app.listen(PORT, () => {
      console.log('🚀 Servidor Backend Municipal Tancítaro iniciado');
      console.log(`📍 Puerto: ${PORT}`);
      console.log(`🌐 Ambiente: ${process.env.NODE_ENV}`);
      console.log(`📊 API disponible en: http://localhost:${PORT}/api`);
      console.log(`❤️  Ruta de salud: http://localhost:${PORT}/api/salud`);
    });

  } catch (error) {
    console.error('❌ Error iniciando servidor:', error.message);
    process.exit(1);
  }
};

// Iniciar servidor
iniciarServidor();

module.exports = app;