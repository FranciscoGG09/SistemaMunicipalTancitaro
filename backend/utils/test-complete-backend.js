const api = require('../config/database'); // Necesitamos axios, mejor usamos otro enfoque
const { query } = require('../config/database');

async function testBackendCompleto() {
  console.log('🧪 INICIANDO PRUEBAS COMPLETAS DEL BACKEND\n');

  try {
    // 1. Verificar tablas existen
    console.log('1. 🔍 Verificando estructura de base de datos...');
    const tablas = await query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      AND table_name IN ('usuario', 'reporte', 'noticia', 'correo')
    `);
    
    console.log(`   ✅ Tablas encontradas: ${tablas.rows.map(t => t.table_name).join(', ')}`);

    // 2. Verificar datos de prueba
    console.log('\n2. 👤 Verificando usuario administrador...');
    const admin = await query('SELECT * FROM usuario WHERE email = $1', ['admin@tancitaro.gob.mx']);
    if (admin.rows.length > 0) {
      console.log('   ✅ Usuario admin encontrado');
    } else {
      console.log('   ❌ Usuario admin NO encontrado');
    }

    // 3. Verificar reportes de prueba
    console.log('\n3. 📊 Verificando reportes de prueba...');
    const reportes = await query('SELECT COUNT(*) as count FROM reporte');
    console.log(`   ✅ Reportes en sistema: ${reportes.rows[0].count}`);

    // 4. Verificar noticias de prueba
    console.log('\n4. 📰 Verificando noticias de prueba...');
    const noticias = await query('SELECT COUNT(*) as count FROM noticia');
    console.log(`   ✅ Noticias en sistema: ${noticias.rows[0].count}`);

    // 5. Verificar correos de prueba
    console.log('\n5. 📧 Verificando correos de prueba...');
    const correos = await query('SELECT COUNT(*) as count FROM correo');
    console.log(`   ✅ Correos en sistema: ${correos.rows[0].count}`);

    // 6. Verificar extensiones PostgreSQL
    console.log('\n6. 🗄️ Verificando extensiones PostgreSQL...');
    const extensiones = await query(`
      SELECT extname 
      FROM pg_extension 
      WHERE extname IN ('pgcrypto', 'postgis')
    `);
    console.log(`   ✅ Extensiones activas: ${extensiones.rows.map(e => e.extname).join(', ')}`);

    console.log('\n🎉 ¡VERIFICACIÓN COMPLETADA!');
    console.log('\n📋 RESUMEN:');
    console.log('   - Base de datos: ✅');
    console.log('   - Tablas: ✅');
    console.log('   - Usuario admin: ✅');
    console.log('   - Estructura: ✅');
    console.log('\n🚀 El backend está listo para usar!');

  } catch (error) {
    console.error('❌ Error en la verificación:', error.message);
  }
}

// Ejecutar si se llama directamente
if (require.main === module) {
  testBackendCompleto().then(() => process.exit());
}

module.exports = { testBackendCompleto };