const { query, pool } = require('../config/database');

class Noticia {
  // Crear nueva noticia
  async crear(noticiaData) {
    const {
      titulo, contenido, adjuntos, urls_externas, prioritaria, usuario_id
    } = noticiaData;

    const sql = `
      INSERT INTO noticia (titulo, contenido, adjuntos, urls_externas, prioritaria, usuario_id)
      VALUES (?, ?, ?, ?, ?, ?)
    `;

    const [result] = await pool.execute(sql, [
      titulo, contenido,
      JSON.stringify(adjuntos || []),
      JSON.stringify(urls_externas || []),
      prioritaria || false,
      usuario_id
    ]);

    return this.obtenerPorId(result.insertId);
  }

  // Obtener todas las noticias con paginación
  async obtenerTodas(pagina = 1, limite = 10, filtros = {}) {
    let whereConditions = [];
    let valores = [];

    // Construir filtros dinámicos
    if (filtros.prioritaria !== undefined) {
      whereConditions.push('prioritaria = ?');
      valores.push(filtros.prioritaria);
    }

    const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';

    // Consulta principal con paginación
    const sql = `
      SELECT n.*, u.nombre as usuario_nombre, u.email as usuario_email
      FROM noticia n
      LEFT JOIN usuario u ON n.usuario_id = u.id
      ${whereClause}
      ORDER BY n.publicado_en DESC
      LIMIT ? OFFSET ?
    `;

    const offset = (pagina - 1) * parseInt(limite);
    valores.push(parseInt(limite), offset);

    const { rows } = await query(sql, valores);
    return rows;
  }

  // Obtener noticia por ID
  async obtenerPorId(id) {
    const sql = `
      SELECT n.*, u.nombre as usuario_nombre, u.email as usuario_email
      FROM noticia n
      LEFT JOIN usuario u ON n.usuario_id = u.id
      WHERE n.id = ?
    `;

    const { rows } = await query(sql, [id]);
    return rows[0];
  }

  // Actualizar noticia
  async actualizar(id, datosActualizados) {
    const camposPermitidos = ['titulo', 'contenido', 'adjuntos', 'urls_externas', 'prioritaria'];
    const campos = [];
    const valores = [];

    Object.keys(datosActualizados).forEach(key => {
      if (camposPermitidos.includes(key) && datosActualizados[key] !== undefined) {
        let valor = datosActualizados[key];

        // Si es un campo JSON (array), stringificarlo
        if (['adjuntos', 'urls_externas'].includes(key) && Array.isArray(valor)) {
          valor = JSON.stringify(valor);
        }

        campos.push(`${key} = ?`);
        valores.push(valor);
      }
    });

    if (campos.length === 0) {
      throw new Error('No hay campos válidos para actualizar');
    }

    valores.push(id);
    const sql = `UPDATE noticia SET ${campos.join(', ')} WHERE id = ?`;

    await pool.execute(sql, valores);
    return this.obtenerPorId(id);
  }

  // Eliminar noticia
  async eliminar(id) {
    const sql = 'DELETE FROM noticia WHERE id = ?';
    await pool.execute(sql, [id]);
    return { id };
  }
}

module.exports = new Noticia();