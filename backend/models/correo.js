const { query, pool } = require('../config/database');

class Correo {
  // Crear nuevo correo
  async crear(correoData) {
    const { id, remitente_id, destinatarios, asunto, cuerpo, adjuntos } = correoData;

    const sql = `
      INSERT INTO correo (id, remitente_id, destinatarios, asunto, cuerpo, adjuntos)
      VALUES (?, ?, ?, ?, ?, ?)
    `;

    await pool.execute(sql, [
      id,
      remitente_id,
      JSON.stringify(destinatarios || []),
      asunto,
      cuerpo,
      JSON.stringify(adjuntos || [])
    ]);

    return this.obtenerPorId(id);
  }

  // Obtener correos por destinatario
  async obtenerPorDestinatario(usuarioId, pagina = 1, limite = 10) {
    const offset = (pagina - 1) * parseInt(limite);

    // En MySQL usamos JSON_CONTAINS para buscar en un array JSON
    const sql = `
      SELECT c.*, u.nombre as remitente_nombre, u.email as remitente_email
      FROM correo c
      LEFT JOIN usuario u ON c.remitente_id = u.id
      WHERE JSON_CONTAINS(c.destinatarios, CAST(? AS CHAR))
      ORDER BY c.enviado_en DESC
      LIMIT ? OFFSET ?
    `;

    const { rows } = await query(sql, [usuarioId, parseInt(limite), offset]);
    return rows;
  }

  // Obtener correos enviados por un usuario
  async obtenerPorRemitente(remitenteId, pagina = 1, limite = 10) {
    const offset = (pagina - 1) * parseInt(limite);

    const sql = `
      SELECT c.*
      FROM correo c
      WHERE c.remitente_id = ?
      ORDER BY c.enviado_en DESC
      LIMIT ? OFFSET ?
    `;

    const { rows } = await query(sql, [remitenteId, parseInt(limite), offset]);
    return rows;
  }

  // Obtener correo por ID
  async obtenerPorId(id) {
    const sql = `
      SELECT c.*, u.nombre as remitente_nombre, u.email as remitente_email
      FROM correo c
      LEFT JOIN usuario u ON c.remitente_id = u.id
      WHERE c.id = ?
    `;

    const { rows } = await query(sql, [id]);
    return rows[0];
  }

  // Marcar correo como leído
  async marcarComoLeido(id) {
    const sql = 'UPDATE correo SET leido = true WHERE id = ?';
    await pool.execute(sql, [id]);
    return this.obtenerPorId(id);
  }

  // Eliminar correo
  async eliminar(id) {
    const sql = 'DELETE FROM correo WHERE id = ?';
    await pool.execute(sql, [id]);
    return { id };
  }

  // Obtener estadísticas de correos
  async obtenerEstadisticas(usuarioId) {
    // MySQL no soporta FILTER, usamos SUM(CASE ...)
    const sql = `
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN leido = true THEN 1 ELSE 0 END) as leidos,
        SUM(CASE WHEN leido = false THEN 1 ELSE 0 END) as no_leidos
      FROM correo 
      WHERE JSON_CONTAINS(destinatarios, CAST(? AS CHAR))
    `;

    const { rows } = await query(sql, [usuarioId]);
    return rows[0];
  }
}

module.exports = new Correo();