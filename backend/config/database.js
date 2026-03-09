const mysql = require('mysql2/promise');
require('dotenv').config();

// Configuración del pool de conexiones MySQL
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || '3306'),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  waitForConnections: true,
  connectionLimit: 20,
  queueLimit: 0
});

// Función para probar la conexión
const testConnection = async () => {
  try {
    const connection = await pool.getConnection();
    console.log('✅ Conexión a MySQL establecida correctamente');
    connection.release();
    return true;
  } catch (error) {
    console.error('❌ Error conectando a MySQL:', error.message);
    return false;
  }
};

module.exports = {
  // Helper para mantener compatibilidad con el resto del código
  query: async (sql, params) => {
    try {
      const [rows] = await pool.execute(sql, params);
      return { rows };
    } catch (error) {
      console.error('Database query error:', error);
      throw error;
    }
  },
  pool,
  testConnection
};