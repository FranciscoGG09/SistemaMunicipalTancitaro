const { query } = require('../config/database');

async function runMigration() {
  try {
    console.log('Iniciando conciliación de esquema...');

    // Habilitar PostGIS si es necesario
    await query('CREATE EXTENSION IF NOT EXISTS postgis');

    // Tabla Usuario
    await query(`
      CREATE TABLE IF NOT EXISTS usuario (
        id SERIAL PRIMARY KEY,
        nombre VARCHAR(100) NOT NULL,
        email VARCHAR(100) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        rol VARCHAR(20) NOT NULL CHECK (rol IN ('admin', 'comunicacion_social', 'trabajador', 'ciudadano')),
        departamento VARCHAR(50),
        creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Tabla Reporte
    await query(`
      CREATE TABLE IF NOT EXISTS reporte (
        id VARCHAR(50) PRIMARY KEY, -- ID generado (UUID o similar desde el cliente/server)
        usuario_id INTEGER REFERENCES usuario(id),
        titulo VARCHAR(200) NOT NULL,
        descripcion TEXT,
        categoria VARCHAR(50),
        ubicacion GEOMETRY(Point, 4326),
        fotos JSONB DEFAULT '[]',
        dispositivo_origen VARCHAR(100),
        estado VARCHAR(20) DEFAULT 'recibido' CHECK (estado IN ('recibido', 'en_proceso', 'concluido')),
        historial_estados JSONB DEFAULT '[]',
        creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Tabla Noticia
    await query(`
      CREATE TABLE IF NOT EXISTS noticia (
        id SERIAL PRIMARY KEY,
        usuario_id INTEGER REFERENCES usuario(id),
        titulo VARCHAR(200) NOT NULL,
        contenido TEXT NOT NULL,
        adjuntos JSONB DEFAULT '[]',
        urls_externas JSONB DEFAULT '[]',
        prioritaria BOOLEAN DEFAULT FALSE,
        publicado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Tabla Correo/Mensajes
    await query(`
      CREATE TABLE IF NOT EXISTS correo (
        id UUID PRIMARY KEY,
        remitente_id INTEGER REFERENCES usuario(id),
        destinatarios JSONB NOT NULL, -- Array de IDs de usuarios
        asunto VARCHAR(200) NOT NULL,
        cuerpo TEXT NOT NULL,
        leido_por JSONB DEFAULT '[]', -- Array de IDs que ya leyeron
        enviado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    console.log('Esquema conciliado exitosamente.');
  } catch (error) {
    console.error('Error durante la migración:', error);
  } finally {
    process.exit();
  }
}

runMigration();
