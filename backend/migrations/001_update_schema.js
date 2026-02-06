const { query } = require('../config/database');

async function runMigration() {
    try {
        console.log('Iniciando migración...');

        // Agregar columna historial_estados si no existe
        await query(`
      ALTER TABLE reporte 
      ADD COLUMN IF NOT EXISTS historial_estados JSONB DEFAULT '[]';
    `);

        console.log('Migración completada exitosamente.');
    } catch (error) {
        console.error('Error durante la migración:', error);
    } finally {
        process.exit();
    }
}

runMigration();
