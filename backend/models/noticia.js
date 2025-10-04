const { query } = require('../config/database');

class Noticia {
  // Crear nueva noticia
  async crear(noticiaData) {
    const {
      titulo, contenido, adjuntos, urls_externas, prioritaria, usuario_id
    } = noticiaData;

    const sql = `
      INSERT INTO noticia (titulo, contenido, adjuntos, urls_externas, prioritaria, usuario_id)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `;

    const result = await query(sql, [
      titulo, contenido, 
      adjuntos || [], 
      urls_externas || [], 
      prioritaria || false, 
      usuario_id
    ]);

    return result.rows[0];
  }

  // Obtener todas las noticias con paginación
  async obtenerTodas(pagina = 1, limite = 10, filtros = {}) {
    let whereConditions = [];
    let valores = [];
    let contador = 1;

    // Construir filtros dinámicos
    if (filtros.prioritaria !== undefined) {
      whereConditions.push(`prioritaria = $${contador}`);
      valores.push(filtros.prioritaria);
      contador++;
    }

    const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';

    // Consulta principal con paginación
    const sql = `
      SELECT n.*, u.nombre as usuario_nombre, u.email as usuario_email
      FROM noticia n
      LEFT JOIN usuario u ON n.usuario_id = u.id
      ${whereClause}
      ORDER BY n.publicado_en DESC
      LIMIT $${contador} OFFSET $${contador + 1}
    `;

    const offset = (pagina - 1) * limite;
    valores.push(limite, offset);

    const result = await query(sql, valores);
    return result.rows;
  }

  // Obtener noticia por ID
  async obtenerPorId(id) {
    const sql = `
      SELECT n.*, u.nombre as usuario_nombre, u.email as usuario_email
      FROM noticia n
      LEFT JOIN usuario u ON n.usuario_id = u.id
      WHERE n.id = $1
    `;

    const result = await query(sql, [id]);
    return result.rows[0];
  }

  // Actualizar noticia
  async actualizar(id, datosActualizados) {
    const camposPermitidos = ['titulo', 'contenido', 'adjuntos', 'urls_externas', 'prioritaria'];
    const campos = [];
    const valores = [];
    let contador = 1;

    Object.keys(datosActualizados).forEach(key => {
      if (camposPermitidos.includes(key) && datosActualizados[key] !== undefined) {
        campos.push(`${key} = $${contador}`);
        valores.push(datosActualizados[key]);
        contador++;
      }
    });

    if (campos.length === 0) {
      throw new Error('No hay campos válidos para actualizar');
    }

    valores.push(id);
    const sql = `UPDATE noticia SET ${campos.join(', ')} WHERE id = $${contador} RETURNING *`;

    const result = await query(sql, valores);
    return result.rows[0];
  }

  // Eliminar noticia
  async eliminar(id) {
    const sql = 'DELETE FROM noticia WHERE id = $1 RETURNING *';
    const result = await query(sql, [id]);
    return result.rows[0];
  }
}

module.exports = new Noticia();