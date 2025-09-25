const { query } = require('../config/database');
const bcrypt = require('bcryptjs');

class Usuario {
  // Crear nuevo usuario
  async crear(usuarioData) {
    const { nombre, email, password, rol, departamento } = usuarioData;
    
    // Hash de la contraseña
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);
    
    const sql = `
      INSERT INTO usuario (nombre, email, password_hash, rol, departamento) 
      VALUES ($1, $2, $3, $4, $5) 
      RETURNING id, nombre, email, rol, departamento, creado_en
    `;
    
    const result = await query(sql, [nombre, email, passwordHash, rol, departamento]);
    return result.rows[0];
  }

  // Buscar usuario por email
  async buscarPorEmail(email) {
    const sql = 'SELECT * FROM usuario WHERE email = $1';
    const result = await query(sql, [email]);
    return result.rows[0];
  }

  // Buscar usuario por ID
  async buscarPorId(id) {
    const sql = 'SELECT id, nombre, email, rol, departamento, creado_en FROM usuario WHERE id = $1';
    const result = await query(sql, [id]);
    return result.rows[0];
  }

  // Verificar contraseña
  async verificarPassword(passwordPlain, passwordHash) {
    return await bcrypt.compare(passwordPlain, passwordHash);
  }

  // Actualizar usuario
  async actualizar(id, datosActualizados) {
    const camposPermitidos = ['nombre', 'departamento'];
    const campos = [];
    const valores = [];
    let contador = 1;

    // Construir dinámicamente la consulta
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
    const sql = `UPDATE usuario SET ${campos.join(', ')} WHERE id = $${contador} RETURNING *`;
    
    const result = await query(sql, valores);
    return result.rows[0];
  }
}

module.exports = new Usuario();