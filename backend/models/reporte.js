const { query } = require('../config/database');

class Reporte {
  // Crear nuevo reporte
  async crear(reporteData) {
    const {
      id, usuario_id, titulo, descripcion, categoria, 
      longitud, latitud, fotos, dispositivo_origen
    } = reporteData;

    const sql = `
      INSERT INTO reporte (id, usuario_id, titulo, descripcion, categoria, ubicacion, fotos, dispositivo_origen)
      VALUES ($1, $2, $3, $4, $5, ST_SetSRID(ST_MakePoint($6, $7), 4326), $8, $9)
      RETURNING *
    `;

    const result = await query(sql, [
      id, usuario_id, titulo, descripcion, categoria, 
      longitud, latitud, fotos || [], dispositivo_origen
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

    const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';

    // Consulta principal con paginación
    const sql = `
      SELECT r.*, u.nombre as usuario_nombre, u.email as usuario_email
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
      SELECT r.*, u.nombre as usuario_nombre, u.email as usuario_email
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
  async obtenerEstadisticas() {
    const sql = `
      SELECT 
        categoria,
        estado,
        COUNT(*) as cantidad
      FROM reporte
      GROUP BY categoria, estado
      ORDER BY categoria, estado
    `;

    const result = await query(sql);
    return result.rows;
  }
}

module.exports = new Reporte();