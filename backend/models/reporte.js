const { query } = require('../config/database');

class Reporte {
  // Crear nuevo reporte
  async crear(reporteData) {
    const {
      id, usuario_id, titulo, descripcion, categoria,
      longitud, latitud, fotos, dispositivo_origen
    } = reporteData;

    const sql = `
      INSERT INTO reporte (id, usuario_id, titulo, descripcion, categoria, ubicacion, fotos, dispositivo_origen, historial_estados)
      VALUES ($1, $2, $3, $4, $5, ST_SetSRID(ST_MakePoint($6, $7), 4326), $8, $9, $10)
      RETURNING *
    `;

    const historialInicial = JSON.stringify([{
      estado: 'recibido',
      fecha: new Date().toISOString(),
      usuario_id: usuario_id, // El usuario que crea el reporte
      notas: 'Reporte creado'
    }]);

    const result = await query(sql, [
      id, usuario_id, titulo, descripcion, categoria,
      longitud, latitud, JSON.stringify(fotos || []), dispositivo_origen,
      historialInicial
    ]);

    return result.rows[0];
  }

  // Obtener todos los reportes con paginación
  async obtenerTodos(pagina = 1, limite = 10, filtros = {}) {
    let whereConditions = [];
    let valores = [];
    let contador = 1;

    // Construir filtros dinámicos
    if (filtros.categoria) {
      whereConditions.push(`categoria = $${contador}`);
      valores.push(filtros.categoria);
      contador++;
    }

    if (filtros.estado) {
      whereConditions.push(`estado = $${contador}`);
      valores.push(filtros.estado);
      contador++;
    }

    if (filtros.usuario_id) {
      whereConditions.push(`usuario_id = $${contador}`);
      valores.push(filtros.usuario_id);
      contador++;
    }

    // Filtros para Trabajadores (por categoria/departamento)
    if (filtros.categoria) {
      whereConditions.push(`categoria = $${contador}`);
      valores.push(filtros.categoria);
      contador++;
    }

    const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';

    // Consulta principal con paginación
    const sql = `
      SELECT r.*, ST_Y(r.ubicacion) as latitud, ST_X(r.ubicacion) as longitud, u.nombre as usuario_nombre, u.email as usuario_email
      FROM reporte r
      LEFT JOIN usuario u ON r.usuario_id = u.id
      ${whereClause}
      ORDER BY r.creado_en DESC
      LIMIT $${contador} OFFSET $${contador + 1}
    `;

    const offset = (pagina - 1) * limite;
    valores.push(limite, offset);

    const result = await query(sql, valores);
    return result.rows;
  }

  // Obtener reporte por ID
  async obtenerPorId(id) {
    const sql = `
      SELECT r.*, ST_Y(r.ubicacion) as latitud, ST_X(r.ubicacion) as longitud, u.nombre as usuario_nombre, u.email as usuario_email
      FROM reporte r
      LEFT JOIN usuario u ON r.usuario_id = u.id
      WHERE r.id = $1
    `;

    const result = await query(sql, [id]);
    return result.rows[0];
  }

  // Actualizar reporte
  async actualizar(id, datosActualizados) {
    const camposPermitidos = ['titulo', 'descripcion', 'categoria', 'estado'];
    const campos = [];
    const valores = [];
    let contador = 1;

    Object.keys(datosActualizados).forEach(key => {
      if (camposPermitidos.includes(key)) {
        campos.push(`${key} = $${contador}`);
        valores.push(datosActualizados[key]);
        contador++;
      }
    });

    if (campos.length === 0) {
      throw new Error('No hay campos válidos para actualizar');
    }

    // Manejo especial para actualización de estado
    if (datosActualizados.estado) {
      // Obtener historial actual
      const reporteActual = await this.obtenerPorId(id);
      let historial = reporteActual.historial_estados || [];

      // Si es string (desde BD), parsear
      if (typeof historial === 'string') historial = JSON.parse(historial);

      // Agregar nuevo estado
      historial.push({
        estado: datosActualizados.estado,
        fecha: new Date().toISOString(),
        usuario_id: datosActualizados.usuario_actualizador_id, // Debe pasarse desde el controller
        notas: datosActualizados.notas || ''
      });

      campos.push(`historial_estados = $${contador}`);
      valores.push(JSON.stringify(historial));
      contador++;
    }

    valores.push(id);
    const sql = `UPDATE reporte SET ${campos.join(', ')} WHERE id = $${contador} RETURNING *`;

    const result = await query(sql, valores);
    return result.rows[0];
  }

  // Eliminar reporte
  async eliminar(id) {
    const sql = 'DELETE FROM reporte WHERE id = $1 RETURNING *';
    const result = await query(sql, [id]);
    return result.rows[0];
  }

  // Estadísticas de reportes
  async obtenerEstadisticas(filtros = {}) {
    let whereConditions = [];
    let valores = [];
    let contador = 1;

    if (filtros.usuario_id) {
      whereConditions.push(`usuario_id = $${contador}`);
      valores.push(filtros.usuario_id);
      contador++;
    }

    if (filtros.categoria) {
      whereConditions.push(`categoria = $${contador}`);
      valores.push(filtros.categoria);
      contador++;
    }

    const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';

    const sql = `
      SELECT 
        categoria,
        estado,
        COUNT(*) as cantidad
      FROM reporte
      ${whereClause}
      GROUP BY categoria, estado
      ORDER BY categoria, estado
    `;

    const result = await query(sql, valores);
    return result.rows;
  }
}

module.exports = new Reporte();