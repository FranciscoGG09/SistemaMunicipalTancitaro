const { query, pool } = require('../config/database');

class Reporte {
  // Crear nuevo reporte
  async crear(reporteData) {
    const {
      id, usuario_id, titulo, descripcion, categoria,
      longitud, latitud, fotos, dispositivo_origen
    } = reporteData;

    const sql = `
      INSERT INTO reporte (id, usuario_id, titulo, descripcion, categoria, latitud, longitud, fotos, dispositivo_origen, historial_estados)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const historialInicial = JSON.stringify([{
      estado: 'recibido',
      fecha: new Date().toISOString(),
      usuario_id: usuario_id,
      notas: 'Reporte creado'
    }]);

    await pool.execute(sql, [
      id, usuario_id, titulo, descripcion, categoria,
      latitud, longitud, JSON.stringify(fotos || []), dispositivo_origen,
      historialInicial
    ]);

    return this.obtenerPorId(id);
  }

  // Obtener todos los reportes con paginación
  async obtenerTodos(pagina = 1, limite = 10, filtros = {}) {
    let whereConditions = [];
    let valores = [];

    // Construir filtros dinámicos
    if (filtros.categoria) {
      whereConditions.push('categoria = ?');
      valores.push(filtros.categoria);
    }

    if (filtros.estado) {
      whereConditions.push('estado = ?');
      valores.push(filtros.estado);
    }

    if (filtros.usuario_id) {
      whereConditions.push('usuario_id = ?');
      valores.push(filtros.usuario_id);
    }

    const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';

    // Consulta principal con paginación
    const sql = `
      SELECT r.*, u.nombre as usuario_nombre, u.email as usuario_email
      FROM reporte r
      LEFT JOIN usuario u ON r.usuario_id = u.id
      ${whereClause}
      ORDER BY r.creado_en DESC
      LIMIT ? OFFSET ?
    `;

    const offset = (pagina - 1) * parseInt(limite);
    valores.push(parseInt(limite), offset);

    const { rows } = await query(sql, valores);
    return rows;
  }

  // Obtener reporte por ID
  async obtenerPorId(id) {
    const sql = `
      SELECT r.*, u.nombre as usuario_nombre, u.email as usuario_email
      FROM reporte r
      LEFT JOIN usuario u ON r.usuario_id = u.id
      WHERE r.id = ?
    `;

    const { rows } = await query(sql, [id]);
    return rows[0];
  }

  // Actualizar reporte
  async actualizar(id, datosActualizados) {
    const camposPermitidos = ['titulo', 'descripcion', 'categoria', 'estado'];
    const campos = [];
    const valores = [];

    Object.keys(datosActualizados).forEach(key => {
      if (camposPermitidos.includes(key)) {
        campos.push(`${key} = ?`);
        valores.push(datosActualizados[key]);
      }
    });

    if (campos.length === 0 && !datosActualizados.estado) {
      throw new Error('No hay campos válidos para actualizar');
    }

    // Manejo especial para actualización de estado
    if (datosActualizados.estado) {
      const reporteActual = await this.obtenerPorId(id);
      let historial = reporteActual.historial_estados || [];

      if (typeof historial === 'string') historial = JSON.parse(historial);

      historial.push({
        estado: datosActualizados.estado,
        fecha: new Date().toISOString(),
        usuario_id: datosActualizados.usuario_actualizador_id,
        notas: datosActualizados.notas || ''
      });

      campos.push('historial_estados = ?');
      valores.push(JSON.stringify(historial));
    }

    valores.push(id);
    const sql = `UPDATE reporte SET ${campos.join(', ')} WHERE id = ?`;

    await pool.execute(sql, valores);
    return this.obtenerPorId(id);
  }

  // Eliminar reporte
  async eliminar(id) {
    const sql = 'DELETE FROM reporte WHERE id = ?';
    await pool.execute(sql, [id]);
    return { id };
  }

  // Estadísticas de reportes
  async obtenerEstadisticas(filtros = {}) {
    let whereConditions = [];
    let valores = [];

    if (filtros.usuario_id) {
      whereConditions.push('usuario_id = ?');
      valores.push(filtros.usuario_id);
    }

    if (filtros.categoria) {
      whereConditions.push('categoria = ?');
      valores.push(filtros.categoria);
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

    const { rows } = await query(sql, valores);
    return rows;
  }
}

module.exports = new Reporte();