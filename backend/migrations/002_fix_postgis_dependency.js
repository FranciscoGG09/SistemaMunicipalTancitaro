const { query } = require('../config/database');

async function runMigration() {
  try {
    console.log('Iniciando migración: Reemplazando PostGIS por columnas estándar...');

    // 1. Eliminar la columna de PostGIS si existe
    await query(`
      ALTER TABLE reporte 
      DROP COLUMN IF EXISTS ubicacion;
    `);

    // 2. Agregar columnas latitud y longitud como DOUBLE PRECISION
    await query(`
      ALTER TABLE reporte 
      ADD COLUMN IF NOT EXISTS latitud DOUBLE PRECISION,
      ADD COLUMN IF NOT EXISTS longitud DOUBLE PRECISION;
    `);

    console.log('Migración completada exitosamente. El servidor ya no depende de PostGIS.');
  } catch (error) {
    console.error('Error durante la migración:', error);
  } finally {
    process.exit();
  }
}

runMigration();
