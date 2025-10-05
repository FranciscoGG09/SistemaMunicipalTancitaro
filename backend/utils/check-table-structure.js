const { query } = require('../config/database');

async function checkTableStructure() {
  try {
    console.log('🔍 Verificando estructura de la tabla reporte...');
    
    const result = await query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns 
      WHERE table_name = 'reporte'
      ORDER BY ordinal_position
    `);
    
    console.log('\n📊 Estructura de la tabla reporte:');
    result.rows.forEach(col => {
      console.log(`   ${col.column_name} (${col.data_type}) - ${col.is_nullable === 'YES' ? 'NULL' : 'NOT NULL'}`);
    });
    
    // Verificar si existe la columna ubicacion
    const hasUbicacion = result.rows.some(col => col.column_name === 'ubicacion');
    const hasLongitud = result.rows.some(col => col.column_name === 'longitud');
    const hasLatitud = result.rows.some(col => col.column_name === 'latitud');
    
    console.log('\n🎯 Diagnóstico:');
    console.log(`   ✅ Columna 'ubicacion' existe: ${hasUbicacion}`);
    console.log(`   ❌ Columna 'longitud' existe: ${hasLongitud}`);
    console.log(`   ❌ Columna 'latitud' existe: ${hasLatitud}`);
    
    if (!hasUbicacion && (!hasLongitud || !hasLatitud)) {
      console.log('\n💡 SOLUCIÓN: Necesitamos actualizar la estructura de la tabla.');
      console.log('   Ejecuta: node utils/update-table-structure.js');
    }
    
  } catch (error) {
    console.error('❌ Error verificando estructura:', error.message);
  }
}

if (require.main === module) {
  checkTableStructure().then(() => process.exit());
}

module.exports = { checkTableStructure };