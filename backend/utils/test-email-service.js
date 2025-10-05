const { 
  enviarCorreoNotificacion,
  enviarNotificacionNuevoReporte 
} = require('./emailService');

async function testEmailService() {
  console.log('📧 Probando servicio de emails...');

  try {
    // Prueba 1: Correo simple
    console.log('1. Enviando correo de prueba...');
    const resultado1 = await enviarCorreoNotificacion(
      'test@ejemplo.com',
      'Prueba del Sistema Municipal',
      '<h3>Este es un correo de prueba</h3><p>Si recibes esto, el servicio de emails funciona correctamente.</p>'
    );

    if (resultado1.exito) {
      console.log('   ✅ Correo enviado exitosamente');
    } else {
      console.log('   ⚠️ Correo no enviado (configuración requerida)');
      console.log('   💡 Configura EMAIL_USER y EMAIL_PASS en .env');
    }

    // Prueba 2: Notificación de reporte
    console.log('\n2. Probando notificación de reporte...');
    const reporteEjemplo = {
      titulo: 'Reporte de prueba',
      categoria: 'bache',
      descripcion: 'Bache en calle principal',
      creado_en: new Date()
    };

    const usuarioEjemplo = {
      nombre: 'Usuario de Prueba',
      email: 'usuario@ejemplo.com'
    };

    const resultado2 = await enviarNotificacionNuevoReporte(reporteEjemplo, usuarioEjemplo);
    
    if (resultado2 && resultado2.exito) {
      console.log('   ✅ Notificación de reporte enviada');
    } else {
      console.log('   ⚠️ Notificación no enviada (configuración requerida)');
    }

  } catch (error) {
    console.error('❌ Error probando servicio de emails:', error.message);
  }
}

if (require.main === module) {
  testEmailService().then(() => {
    console.log('\n💡 Para configurar emails:');
    console.log('   1. Usa Gmail y genera una "contraseña de aplicación"');
    console.log('   2. Agrega EMAIL_USER y EMAIL_PASS en .env');
    console.log('   3. Configura EMAIL_ADMIN para notificaciones');
    process.exit();
  });
}

module.exports = { testEmailService };