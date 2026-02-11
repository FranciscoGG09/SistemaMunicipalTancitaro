const { query } = require('../config/database');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

async function createTestData() {
  console.log('🎯 Creando datos de prueba completos...');

  try {
    // 1. Crear usuarios de prueba y obtener sus IDs reales
    console.log('1. Creando usuarios de prueba...');

    const usuariosData = [
      {
        nombre: 'Administrador Sistema',
        email: 'admin@tancitaro.gob.mx',
        password: 'admin123',
        rol: 'admin',
        departamento: 'Sistemas'
      },
      {
        nombre: 'Trabajador Obras Públicas',
        email: 'obras@tancitaro.gob.mx',
        password: 'password123',
        rol: 'trabajador',
        departamento: 'Obras Públicas'
      },
      {
        nombre: 'Ciudadano Ejemplo',
        email: 'ciudadano@ejemplo.com',
        password: 'password123',
        rol: 'ciudadano',
        departamento: null
      }
    ];

    const usuarios = [];

    for (const usuarioData of usuariosData) {
      // Verificar si el usuario ya existe
      const usuarioExistente = await query(
        'SELECT id FROM usuario WHERE email = $1',
        [usuarioData.email]
      );

      if (usuarioExistente.rows.length > 0) {
        // Usuario ya existe, usar el ID existente
        usuarios.push({
          id: usuarioExistente.rows[0].id,
          ...usuarioData
        });
        console.log(`   ✅ Usuario existente: ${usuarioData.email}`);
      } else {
        // Crear nuevo usuario
        const passwordHash = await bcrypt.hash(usuarioData.password, 10);
        // El ID es SERIAL, no UUID

        const result = await query(
          `INSERT INTO usuario (nombre, email, password_hash, rol, departamento) 
           VALUES ($1, $2, $3, $4, $5) RETURNING id`,
          [usuarioData.nombre, usuarioData.email, passwordHash,
          usuarioData.rol, usuarioData.departamento]
        );

        const nuevoId = result.rows[0].id;

        usuarios.push({
          id: nuevoId,
          ...usuarioData
        });
        console.log(`   ✅ Nuevo usuario: ${usuarioData.email} (ID: ${nuevoId})`);
      }
    }

    // Obtener también el usuario admin existente
    const adminResult = await query(
      'SELECT id, nombre, email, rol FROM usuario WHERE email = $1',
      ['admin@tancitaro.gob.mx']
    );

    if (adminResult.rows.length > 0) {
      usuarios.push({
        id: adminResult.rows[0].id,
        nombre: adminResult.rows[0].nombre,
        email: adminResult.rows[0].email,
        rol: adminResult.rows[0].rol,
        departamento: 'Sistemas'
      });
      console.log(`   ✅ Usuario admin: admin@tancitaro.gob.mx`);
    }

    console.log('\n📋 Usuarios disponibles:');
    usuarios.forEach(usuario => {
      console.log(`   - ${usuario.email} (${usuario.rol}) - ID: ${usuario.id}`);
    });

    // 2. Crear reportes de prueba - USANDO LOS IDs REALES
    console.log('\n2. Creando reportes de prueba...');

    const reportes = [
      {
        titulo: 'Bache grande en Av. Principal',
        descripcion: 'Bache de aproximadamente 50cm de diámetro que representa peligro',
        categoria: 'bache',
        longitud: -102.352188,
        latitud: 19.337139
      },
      {
        titulo: 'Lámpara dañada en Parque Central',
        descripcion: 'Poste de alumbrado con lámpara rota',
        categoria: 'alumbrado',
        longitud: -102.351234,
        latitud: 19.338567
      },
      {
        titulo: 'Basura acumulada en mercado',
        descripcion: 'Acumulación de basura por varios días',
        categoria: 'basura',
        longitud: -102.353456,
        latitud: 19.336789
      }
    ];

    // Usar el usuario ciudadano para los reportes (índice 1 en el array)
    const usuarioCiudadano = usuarios.find(u => u.rol === 'ciudadano');
    const usuarioTrabajador = usuarios.find(u => u.rol === 'trabajador');
    const usuarioAdmin = usuarios.find(u => u.rol === 'admin');

    if (!usuarioCiudadano) {
      throw new Error('No se encontró usuario ciudadano para crear reportes');
    }

    for (const reporte of reportes) {
      // Verificar si ya existe un reporte similar
      const reporteExistente = await query(
        'SELECT id FROM reporte WHERE titulo = $1 AND usuario_id = $2',
        [reporte.titulo, usuarioCiudadano.id]
      );

      if (reporteExistente.rows.length === 0) {
        // Usar la función PostGIS ST_MakePoint y ST_SetSRID correctamente
        await query(
          `INSERT INTO reporte (id, usuario_id, titulo, descripcion, categoria, ubicacion, dispositivo_origen)
           VALUES ($1, $2, $3, $4, $5, ST_SetSRID(ST_MakePoint($6, $7), 4326), $8)`,
          [uuidv4(), usuarioCiudadano.id, reporte.titulo, reporte.descripcion, reporte.categoria,
          reporte.longitud, reporte.latitud, 'sistema-prueba']
        );
        console.log(`   ✅ Nuevo reporte: ${reporte.titulo}`);
      } else {
        console.log(`   ⏭️  Reporte ya existe: ${reporte.titulo}`);
      }
    }

    // 3. Crear noticias de prueba
    console.log('\n3. Creando noticias de prueba...');

    const noticias = [
      {
        titulo: 'Inicio de Programa de Reforestación',
        contenido: 'El municipio inicia programa de reforestación en áreas públicas. Se plantarán 500 árboles en parques y camellones.',
        prioritaria: true,
        urls_externas: ['https://facebook.com/gobtancitaro/posts/123']
      },
      {
        titulo: 'Convocatoria para Talleres Municipales',
        contenido: 'Se invita a la ciudadanía a participar en talleres gratuitos de manualidades, computación y jardinería.',
        prioritaria: false,
        urls_externas: []
      }
    ];

    for (const noticia of noticias) {
      const noticiaExistente = await query(
        'SELECT id FROM noticia WHERE titulo = $1',
        [noticia.titulo]
      );

      if (noticiaExistente.rows.length === 0) {
        await query(
          `INSERT INTO noticia (usuario_id, titulo, contenido, prioritaria, urls_externas)
           VALUES ($1, $2, $3, $4, $5)`,
          [usuarioAdmin.id, noticia.titulo, noticia.contenido,
          noticia.prioritaria, JSON.stringify(noticia.urls_externas)]
        );
        console.log(`   ✅ Nueva noticia: ${noticia.titulo}`);
      } else {
        console.log(`   ⏭️  Noticia ya existe: ${noticia.titulo}`);
      }
    }

    // 4. Crear correos de prueba
    console.log('\n4. Creando correos de prueba...');

    // Check if correo table exists first or wrap in try catch if schema might be old
    // Assuming schema is correct from migration file

    const correos = [
      {
        asunto: 'Bienvenida al Sistema Municipal',
        cuerpo: 'Te damos la bienvenida al sistema de gestión municipal. Aquí podrás reportar incidencias y mantenerte informado sobre las actividades del gobierno.',
        destinatarios: [usuarioCiudadano.id]
      },
      {
        asunto: 'Reunión de personal',
        cuerpo: 'Se convoca a reunión de personal el próximo viernes a las 10:00 AM en la sala de juntas.',
        destinatarios: [usuarioTrabajador.id, usuarioAdmin.id]
      }
    ];

    for (const correo of correos) {
      const correoExistente = await query(
        'SELECT id FROM correo WHERE asunto = $1 AND remitente_id = $2',
        [correo.asunto, usuarioAdmin.id]
      );

      if (correoExistente.rows.length === 0) {
        await query(
          `INSERT INTO correo (id, remitente_id, destinatarios, asunto, cuerpo)
           VALUES ($1, $2, $3, $4, $5)`,
          [uuidv4(), usuarioAdmin.id, JSON.stringify(correo.destinatarios), correo.asunto, correo.cuerpo]
        );
        console.log(`   ✅ Nuevo correo: ${correo.asunto}`);
      } else {
        console.log(`   ⏭️  Correo ya existe: ${correo.asunto}`);
      }
    }

    console.log('\n🎉 DATOS DE PRUEBA CREADOS EXITOSAMENTE!');
    console.log('\n🔑 Credenciales para probar:');
    console.log('   Admin: admin@tancitaro.gob.mx / admin123');
    console.log('   Trabajador: obras@tancitaro.gob.mx / password123');
    console.log('   Ciudadano: ciudadano@ejemplo.com / password123');

    console.log('\n📊 Resumen final:');
    const reportesCount = await query('SELECT COUNT(*) as count FROM reporte');
    const noticiasCount = await query('SELECT COUNT(*) as count FROM noticia');
    const correosCount = await query('SELECT COUNT(*) as count FROM correo');
    const usuariosCount = await query('SELECT COUNT(*) as count FROM usuario');

    console.log(`   - Usuarios: ${usuariosCount.rows[0].count}`);
    console.log(`   - Reportes: ${reportesCount.rows[0].count}`);
    console.log(`   - Noticias: ${noticiasCount.rows[0].count}`);
    console.log(`   - Correos: ${correosCount.rows[0].count}`);

  } catch (error) {
    console.error('❌ Error creando datos de prueba:', error.message);
    console.log('\n🔍 Detalles del error:', error);
  }
}

if (require.main === module) {
  createTestData().then(() => process.exit());
}

module.exports = { createTestData };