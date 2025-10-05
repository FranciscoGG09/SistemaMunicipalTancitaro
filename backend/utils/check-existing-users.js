const { query } = require('../config/database');

async function checkExistingUsers() {
  try {
    console.log('🔍 Verificando usuarios existentes en la base de datos...\n');
    
    const result = await query(`
      SELECT id, nombre, email, rol, departamento, creado_en
      FROM usuario 
      ORDER BY creado_en
    `);
    
    console.log('📋 Usuarios en el sistema:');
    console.log('=' .repeat(80));
    
    result.rows.forEach((usuario, index) => {
      console.log(`${index + 1}. ${usuario.nombre}`);
      console.log(`   Email: ${usuario.email}`);
      console.log(`   Rol: ${usuario.rol}`);
      console.log(`   Departamento: ${usuario.departamento || 'N/A'}`);
      console.log(`   ID: ${usuario.id}`);
      console.log(`   Creado: ${usuario.creado_en}`);
      console.log('-'.repeat(40));
    });
    
    console.log(`\n📊 Total: ${result.rows.length} usuarios`);
    
  } catch (error) {
    console.error('❌ Error verificando usuarios:', error.message);
  }
}

if (require.main === module) {
  checkExistingUsers().then(() => process.exit());
}

module.exports = { checkExistingUsers };