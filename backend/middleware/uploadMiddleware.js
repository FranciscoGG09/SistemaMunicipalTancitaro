const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const dotenv = require('dotenv');

dotenv.config();

// Configurar Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

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

// Helper para subir buffer a Cloudinary
const uploadToCloudinary = (buffer) => {
  return new Promise((resolve, reject) => {
    // Verificar si la configuración de Cloudinary es válida o usamos placeholders
    if (!process.env.CLOUDINARY_API_KEY || process.env.CLOUDINARY_API_KEY === 'tu_api_key') {
      console.warn('Cloudinary no configurado correctamente. Saltando subida de imagen.');
      // Devolvemos un objeto que simula una respuesta vacía/sin url segura
      return resolve({ secure_url: null });
    }

    const uploadStream = cloudinary.uploader.upload_stream(
      { folder: 'reportes-tancitaro' },
      (error, result) => {
        if (error) return reject(error);
        resolve(result);
      }
    );
    uploadStream.end(buffer);
  });
};

module.exports = { upload, uploadToCloudinary };