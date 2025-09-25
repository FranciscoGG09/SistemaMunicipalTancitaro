const { query } = require('../config/database');
require('dotenv').config();

// Script SQL para crear las tablas
const createTables = `
-- Activar extensiones necesarias
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "postgis";

-- Tabla USUARIO
CREATE TABLE IF NOT EXISTS usuario (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nombre VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    rol VARCHAR(20) NOT NULL CHECK (rol IN ('admin', 'trabajador', 'ciudadano')),
    departamento VARCHAR(50),
    creado_en TIMESTAMP DEFAULT NOW()
);

-- Tabla REPORTE
CREATE TABLE IF NOT EXISTS reporte (
    id UUID PRIMARY KEY,
    usuario_id UUID REFERENCES usuario(id) ON DELETE SET NULL,
    titulo VARCHAR(200) NOT NULL,
    descripcion TEXT,
    categoria VARCHAR(50) NOT NULL CHECK (categoria IN (
        'bache', 'alumbrado', 'basura', 'fuga', 'vialidad', 'otros'
    )),
    ubicacion GEOGRAPHY(POINT, 4326),
    fotos TEXT[] DEFAULT '{}',
    dispositivo_origen VARCHAR(100),
    sincronizado BOOLEAN DEFAULT false,
    estado VARCHAR(20) DEFAULT 'pendiente' CHECK (estado IN ('pendiente', 'en_proceso', 'completado')),
    creado_en TIMESTAMP DEFAULT NOW()
);

-- Tabla NOTICIA
CREATE TABLE IF NOT EXISTS noticia (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    usuario_id UUID REFERENCES usuario(id) ON DELETE SET NULL,
    titulo VARCHAR(200) NOT NULL,
    contenido TEXT NOT NULL,
    adjuntos TEXT[] DEFAULT '{}',
    urls_externas TEXT[] DEFAULT '{}',
    prioritaria BOOLEAN DEFAULT false,
    publicado_en TIMESTAMP DEFAULT NOW()
);

-- Tabla CORREO
CREATE TABLE IF NOT EXISTS correo (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    remitente_id UUID REFERENCES usuario(id) ON DELETE SET NULL,
    destinatarios UUID[] NOT NULL,
    asunto VARCHAR(200) NOT NULL,
    cuerpo TEXT NOT NULL,
    adjuntos TEXT[] DEFAULT '{}',
    leido BOOLEAN DEFAULT false,
    enviado_en TIMESTAMP DEFAULT NOW()
);

-- Índices para optimización
CREATE INDEX IF NOT EXISTS idx_usuario_email ON usuario(email);
CREATE INDEX IF NOT EXISTS idx_reporte_categoria ON reporte(categoria);
CREATE INDEX IF NOT EXISTS idx_reporte_estado ON reporte(estado);
CREATE INDEX IF NOT EXISTS idx_reporte_ubicacion ON reporte USING GIST(ubicacion);
CREATE INDEX IF NOT EXISTS idx_noticia_publicado ON noticia(publicado_en);
CREATE INDEX IF NOT EXISTS idx_noticia_prioritaria ON noticia(prioritaria);
CREATE INDEX IF NOT EXISTS idx_correo_destinatarios ON correo USING GIN(destinatarios);

-- Insertar usuario administrador por defecto (password: admin123)
INSERT INTO usuario (id, nombre, email, password_hash, rol, departamento) 
VALUES (
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    'Administrador Municipal',
    'admin@tancitaro.gob.mx',
    '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', -- bcrypt hash de 'admin123'
    'admin',
    'Sistemas'
) ON CONFLICT (email) DO NOTHING;
`;

const initializeDatabase = async () => {
  try {
    console.log('🔄 Inicializando base de datos...');
    
    // Ejecutar script de creación
    await query(createTables);
    
    console.log('✅ Base de datos inicializada correctamente');
    console.log('📊 Tablas creadas: usuario, reporte, noticia, correo');
    console.log('👤 Usuario admin creado: admin@tancitaro.gob.mx / admin123');
    
  } catch (error) {
    console.error('❌ Error inicializando base de datos:', error.message);
    process.exit(1);
  }
};

// Ejecutar si se llama directamente
if (require.main === module) {
  initializeDatabase();
}

module.exports = { initializeDatabase };