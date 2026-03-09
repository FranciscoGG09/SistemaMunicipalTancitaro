-- Crear base de datos si no existe
CREATE DATABASE IF NOT EXISTS tancitaro_db;
USE tancitaro_db;

-- Tabla Usuario
CREATE TABLE IF NOT EXISTS usuario (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    rol ENUM('admin', 'comunicacion_social', 'trabajador', 'ciudadano') NOT NULL,
    departamento VARCHAR(50),
    creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- Tabla Reporte
CREATE TABLE IF NOT EXISTS reporte (
    id VARCHAR(50) PRIMARY KEY, -- UUID generado desde el cliente/server
    usuario_id INTEGER,
    titulo VARCHAR(200) NOT NULL,
    descripcion TEXT,
    categoria VARCHAR(50),
    latitud DOUBLE PRECISION,
    longitud DOUBLE PRECISION,
    fotos JSON, -- MySQL soporta JSON nativo
    dispositivo_origen VARCHAR(100),
    estado VARCHAR(20) DEFAULT 'recibido', -- CHECK constraints son ignorados en algunas versiones antiguas de MySQL, mejor manejar en código o usar ENUM
    historial_estados JSON,
    creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (usuario_id) REFERENCES usuario(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- Tabla Noticia
CREATE TABLE IF NOT EXISTS noticia (
    id INT AUTO_INCREMENT PRIMARY KEY,
    usuario_id INTEGER,
    titulo VARCHAR(200) NOT NULL,
    contenido TEXT NOT NULL,
    adjuntos JSON,
    urls_externas JSON,
    prioritaria BOOLEAN DEFAULT FALSE,
    publicado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (usuario_id) REFERENCES usuario(id) ON DELETE SET NULL
) ENGINE=InnoDB;

-- Tabla Correo/Mensajes (Ajustada para MySQL)
CREATE TABLE IF NOT EXISTS correo (
    id VARCHAR(36) PRIMARY KEY, -- Cambiado de UUID a VARCHAR(36)
    remitente_id INTEGER,
    destinatarios JSON NOT NULL, -- Array de IDs de usuarios
    asunto VARCHAR(200) NOT NULL,
    cuerpo TEXT NOT NULL,
    leido BOOLEAN DEFAULT FALSE, -- Simplificado según correo.js
    enviado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (remitente_id) REFERENCES usuario(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ==========================================
-- OPCIONAL: Insertar Usuario Administrador Inicial
-- Contraseña por defecto: admin123
-- ==========================================
-- INSERT INTO usuario (nombre, email, password_hash, rol) 
-- VALUES ('Administrador Central', 'admin@tancitaro.gob.mx', '$2b$10$7R0ZfPB5M7Z7M7Z7M7Z7M.u7Z7M7Z7M7Z7M7Z7M7Z7M7Z7M7Z7M7Z', 'admin');
