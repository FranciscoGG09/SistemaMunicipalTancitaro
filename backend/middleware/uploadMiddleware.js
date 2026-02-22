const multer = require('multer');
const dotenv = require('dotenv');

dotenv.config();

// La configuración de Cloudinary se elimina ya que usaremos Base64 en la base de datos


// Configurar almacenamiento (usando memoria si no está el paquete de storage, 
// pero vamos a asumir que podemos usar stream o intentar instalarlo si falla. 
// Para asegurar compatibilidad con lo que hay, usaré MemoryStorage y un helper de subida)

const storage = multer.memoryStorage();

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB límite
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Solo se permiten imágenes'), false);
    }
  }
});

// Helper para convertir buffer a Base64 (anteriormente uploadToCloudinary)
const uploadToCloudinary = (buffer, mimetype) => {
  return new Promise((resolve) => {
    // Convertimos el buffer a una cadena Base64 con el prefijo de data URI
    const base64 = buffer.toString('base64');
    const dataUrl = `data:${mimetype || 'image/jpeg'};base64,${base64}`;

    // Devolvemos el mismo formato de objeto para no romper los controladores existentes
    resolve({ secure_url: dataUrl });
  });
};

module.exports = { upload, uploadToCloudinary };