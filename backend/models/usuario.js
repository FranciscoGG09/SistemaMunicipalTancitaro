const { query, pool } = require('../config/database');
const bcrypt = require('bcryptjs');

class Usuario {
  // Crear nuevo usuario
  async crear(usuarioData) {
    const { nombre, email, password, rol, departamento } = usuarioData;

    // Validar roles permitidos
    const rolesPermitidos = ['admin', 'comunicacion_social', 'trabajador', 'ciudadano'];
    if (!rolesPermitidos.includes(rol)) {
      throw new Error('Rol no válido');
    }

    // Hash de la contraseña
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    const sql = `
      INSERT INTO usuario (nombre, email, password_hash, rol, departamento) 
      VALUES (?, ?, ?, ?, ?)
    `;

    const [result] = await pool.execute(sql, [nombre, email, passwordHash, rol, departamento]);
    const insertId = result.insertId;

    return this.buscarPorId(insertId);
  }

  // Registrar ciudadano (Público)
  async registrarCiudadano(usuarioData) {
    const { nombre, email, password } = usuarioData;
    return this.crear({
      nombre,
      email,
      password,
      rol: 'ciudadano',
      departamento: null
    });
  }

  // Buscar usuario por email
  async buscarPorEmail(email) {
    const sql = 'SELECT * FROM usuario WHERE email = ?';
    const { rows } = await query(sql, [email]);
    return rows[0];
  }

  // Buscar usuario por ID
  async buscarPorId(id) {
    const sql = 'SELECT id, nombre, email, rol, departamento, creado_en FROM usuario WHERE id = ?';
    const { rows } = await query(sql, [id]);
    return rows[0];
  }

  // Verificar contraseña
  async verificarPassword(passwordPlain, passwordHash) {
    return await bcrypt.compare(passwordPlain, passwordHash);
  }

  // Actualizar usuario
  async actualizar(id, datosActualizados) {
    const camposPermitidos = ['nombre', 'password', 'rol', 'departamento'];
    const campos = [];
    const valores = [];

    // Construir dinámicamente la consulta
    for (const key of Object.keys(datosActualizados)) {
      if (camposPermitidos.includes(key)) {
        let valor = datosActualizados[key];
        let campo = key;

        if (key === 'password') {
          if (!valor) continue;
          valor = await bcrypt.hash(valor, 10);
          campo = 'password_hash';
        }

        campos.push(`${campo} = ?`);
        valores.push(valor);
      }
    }

    if (campos.length === 0) {
      throw new Error('No hay campos válidos para actualizar');
    }

    valores.push(id);
    const sql = `UPDATE usuario SET ${campos.join(', ')} WHERE id = ?`;

    await pool.execute(sql, valores);
    return this.buscarPorId(id);
  }

  // Obtener todos los usuarios
  async obtenerTodos() {
    const sql = 'SELECT id, nombre, email, rol, departamento, creado_en FROM usuario ORDER BY creado_en DESC';
    const { rows } = await query(sql);
    return rows;
  }

  // Eliminar usuario
  async eliminar(id) {
    // Primero eliminar reportes asociados (MySQL maneja ON DELETE CASCADE si se configuró, pero lo mantenemos por consistencia)
    await query('DELETE FROM reporte WHERE usuario_id = ?', [id]);

    const sql = 'DELETE FROM usuario WHERE id = ?';
    await pool.execute(sql, [id]);
    return { id };
  }
}

module.exports = new Usuario();