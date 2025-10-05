const nodemailer = require('nodemailer');
require('dotenv').config();

// Configurar el transporter (ejemplo para Gmail)
const crearTransporter = () => {
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS // Usar contraseña de aplicación para Gmail
    }
  });
};

// Función para enviar correo de notificación
const enviarCorreoNotificacion = async (destinatario, asunto, mensaje) => {
  try {
    const transporter = crearTransporter();

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: destinatario,
      subject: asunto,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2c5aa0;">Sistema Municipal Tancítaro</h2>
          <div style="background: #f5f5f5; padding: 20px; border-radius: 5px;">
            ${mensaje}
          </div>
          <p style="color: #666; font-size: 12px; margin-top: 20px;">
            Este es un mensaje automático, por favor no responda a este correo.
          </p>
        </div>
      `
    };

    const resultado = await transporter.sendMail(mailOptions);
    console.log('Correo de notificación enviado:', resultado.messageId);
    return { exito: true, messageId: resultado.messageId };
  } catch (error) {
    console.error('Error enviando correo de notificación:', error);
    return { exito: false, error: error.message };
  }
};

// Función para enviar notificación de nuevo reporte
const enviarNotificacionNuevoReporte = async (reporte, usuario) => {
  const asunto = `Nuevo Reporte: ${reporte.titulo}`;
  const mensaje = `
    <h3>Se ha creado un nuevo reporte</h3>
    <p><strong>Título:</strong> ${reporte.titulo}</p>
    <p><strong>Categoría:</strong> ${reporte.categoria}</p>
    <p><strong>Descripción:</strong> ${reporte.descripcion}</p>
    <p><strong>Reportado por:</strong> ${usuario.nombre} (${usuario.email})</p>
    <p><strong>Fecha:</strong> ${new Date(reporte.creado_en).toLocaleString()}</p>
  `;

  return await enviarCorreoNotificacion(process.env.EMAIL_ADMIN, asunto, mensaje);
};

// Función para enviar notificación de cambio de estado
const enviarNotificacionCambioEstado = async (reporte, usuario, nuevoEstado) => {
  const asunto = `Actualización de Reporte: ${reporte.titulo}`;
  const mensaje = `
    <h3>Se ha actualizado el estado de tu reporte</h3>
    <p><strong>Título:</strong> ${reporte.titulo}</p>
    <p><strong>Nuevo Estado:</strong> ${nuevoEstado}</p>
    <p><strong>Actualizado por:</strong> ${usuario.nombre}</p>
    <p><strong>Fecha:</strong> ${new Date().toLocaleString()}</p>
  `;

  // Aquí deberías obtener el email del usuario que creó el reporte
  return await enviarCorreoNotificacion('usuario@ejemplo.com', asunto, mensaje);
};

module.exports = {
  enviarCorreoNotificacion,
  enviarNotificacionNuevoReporte,
  enviarNotificacionCambioEstado
};