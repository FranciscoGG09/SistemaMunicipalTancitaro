const { query } = require('../config/database');

class Correo {
  // Crear nuevo correo
  async crear(correoData) {
    const { remitente_id, destinatarios, asunto, cuerpo, adjuntos } = correoData;

    const sql = `
      INSERT INTO correo (remitente_id, destinatarios, asunto, cuerpo, adjuntos)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `;

    const result = await query(sql, [
      remitente_id, 
      destinatarios, 
      asunto, 
      cuerpo, 
      adjuntos || []
    ]);

    return result.rows[0];
  }

  // Obtener correos por destinatario
  async obtenerPorDestinatario(usuarioId, pagina = 1, limite = 10) {
    const offset = (pagina - 1) * limite;
    
    const sql = `
      SELECT c.*, u.nombre as remitente_nombre, u.email as remitente_email
      FROM correo c
      LEFT JOIN usuario u ON c.remitente_id = u.id
      WHERE $1 = ANY(c.destinatarios)
      ORDER BY c.enviado_en DESC
      LIMIT $2 OFFSET $3
    `;

    const result = await query(sql, [usuarioId, limite, offset]);
    return result.rows;
  }

  // Obtener correos enviados por un usuario
  async obtenerPorRemitente(remitenteId, pagina = 1, limite = 10) {
    const offset = (pagina - 1) * limite;
    
    const sql = `
      SELECT c.*, COUNT(*) OVER() as total_count
      FROM correo c
      WHERE c.remitente_id = $1
      ORDER BY c.enviado_en DESC
      LIMIT $2 OFFSET $3
    `;

    const result = await query(sql, [remitenteId, limite, offset]);
    return result.rows;
  }

  // Obtener correo por ID
  async obtenerPorId(id) {
    const sql = `
      SELECT c.*, u.nombre as remitente_nombre, u.email as remitente_email
      FROM correo c
      LEFT JOIN usuario u ON c.remitente_id = u.id
      WHERE c.id = $1
    `;

    const result = await query(sql, [id]);
    return result.rows[0];
  }

  // Marcar correo como leído
  async marcarComoLeido(id) {
    const sql = 'UPDATE correo SET leido = true WHERE id = $1 RETURNING *';
    const result = await query(sql, [id]);
    return result.rows[0];
  }

  // Eliminar correo
  async eliminar(id) {
    const sql = 'DELETE FROM correo WHERE id = $1 RETURNING *';
    const result = await query(sql, [id]);
    return result.rows[0];
  }

  // Obtener estadísticas de correos
  async obtenerEstadisticas(usuarioId) {
    const sql = `
      SELECT 
        COUNT(*) as total,
        COUNT(*) FILTER (WHERE leido = true) as leidos,
        COUNT(*) FILTER (WHERE leido = false) as no_leidos
      FROM correo 
      WHERE $1 = ANY(destinatarios)
    `;

    const result = await query(sql, [usuarioId]);
    return result.rows[0];
  }
}

module.exports = new Correo();