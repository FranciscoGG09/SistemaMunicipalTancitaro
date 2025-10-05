const { v4: uuidv4 } = require('uuid');

// Función para generar UUIDs (ya estamos usando uuidv4 directamente)
// Este archivo es para mantener consistencia con la estructura
const generarUUID = () => {
  return uuidv4();
};

// Función para validar UUID
const esUUIDValido = (uuid) => {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
};

module.exports = {
  generarUUID,
  esUUIDValido
};