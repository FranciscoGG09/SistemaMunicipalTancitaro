const { query } = require('../config/database');
const bcrypt = require('bcryptjs');

async function updateAdminPassword() {
  try {
    console.log('🔄 Actualizando contraseña del admin...');
    
    // Hash de la nueva contraseña "admin123"
    const newPasswordHash = await bcrypt.hash('admin123', 10);
    
    // Actualizar en la base de datos
    await query(
      'UPDATE usuario SET password_hash = $1 WHERE email = $2',
      [newPasswordHash, 'admin@tancitaro.gob.mx']
    );
    
    console.log('✅ Contraseña actualizada exitosamente');
    console.log('   Nuevas credenciales:');
    console.log('   Email: admin@tancitaro.gob.mx');
    console.log('   Password: admin123');
    
  } catch (error) {
    console.error('❌ Error actualizando contraseña:', error.message);
  }
}

updateAdminPassword().then(() => {
  console.log('🎯 Ahora prueba el login con admin123');
  process.exit();
});