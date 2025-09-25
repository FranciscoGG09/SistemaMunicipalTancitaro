const { Pool } = require('pg');
require('dotenv').config();

// Configuración del pool de conexiones PostgreSQL
const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  max: 20, // Máximo de conexiones
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

// Manejo de errores de conexión
pool.on('error', (err, client) => {
  console.error('Error inesperado en el cliente de BD:', err);
  process.exit(-1);
});

// Función para probar la conexión
const testConnection = async () => {
  try {
    const client = await pool.connect();
    console.log('✅ Conexión a PostgreSQL establecida correctamente');
    client.release();
    return true;
  } catch (error) {
    console.error('❌ Error conectando a PostgreSQL:', error.message);
    return false;
  }
};

module.exports = {
  query: (text, params) => pool.query(text, params),
  getClient: () => pool.connect(),
  testConnection
};