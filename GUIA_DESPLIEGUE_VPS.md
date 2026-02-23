# Guía de Despliegue VPS - Sistema Municipal Tancítaro

Esta guía detalla los pasos para desplegar el proyecto en un servidor VPS (Ubuntu/Plesk recomendado).

## 1. Prerrequisitos del Servidor (VPS / Plesk)
Si usas **Plesk**, la mayoría de estos se instalan desde el panel:
- **Node.js**: Habilitar extensión de Node.js en Plesk.
- **PostgreSQL**: Asegurar que PostGIS esté disponible.
- **SSL (Let's Encrypt)**: Instalar certificado gratuito para que la API use `https`.

### Extensiones de Base de Datos
Indispensable para el mapa de reportes:
```bash
sudo apt install postgresql-xx-postgis  # Versión 14, 15 o 16 según tu sistema
```

---

## 2. Despliegue del Backend (API)

1. **Configurar Dominio en Plesk**: Crea un subdominio (ej: `api.tancitaro.gob.mx`).
2. **Subir archivos**: Sube la carpeta `backend` (puedes usar Git o FTP).
3. **Variables de Entorno (.env)**: Crea el archivo en el servidor con datos reales:
   ```env
   NODE_ENV=production
   PORT=3000
   DB_USER=usuario_plesk
   DB_PASSWORD=tu_password_seguro
   DB_NAME=tancitaro_db
   JWT_SECRET=un_codigo_muy_largo_y_aleatorio
   ```
4. **Instalar y Correr**:
   ```bash
   npm install
   # En Plesk, simplemente asegúrate de que el 'Application Startup File' sea server.js
   ```

---

## 3. Despliegue de la App Web (Admin/Frontend)

React se despliega como archivos estáticos:
1. **Configurar URL de API**: En tu PC, edita `frontend/.env`:
   `REACT_APP_API_URL=https://api.tu-dominio.com/api`
2. **Generar el Build**: 
   `npm run build` (dentro de la carpeta frontend).
3. **Subir carpeta `build`**: Copia el contenido de la carpeta resultante a la ruta `httpdocs` de tu dominio en Plesk.
4. **Regla de Redirección**: Para que las rutas de React funcionen (evitar error 404 al recargar), crea un archivo `.htaccess` en Plesk con:
   ```apache
   Options -MultiViews
   RewriteEngine On
   RewriteCond %{REQUEST_FILENAME} !-f
   RewriteCond %{REQUEST_FILENAME} !-d
   RewriteRule ^ index.html [L]
   ```

---

## 4. Construcción y Despliegue de la App Móvil (Flutter)

La app móvil se debe "apuntar" a tu nuevo servidor y luego generar el instalador (.apk).

### Paso A: Cambiar a Producción
1. Abre el archivo `tancitaro/.env` en tu computadora.
2. Modifica la URL para que use tu dominio real con **HTTPS**:
   `API_URL=https://api.tu-dominio.com/api`

### Paso B: Generar el instalador (APK) para Android
En la terminal, dentro de la carpeta `tancitaro`, ejecuta:
```bash
flutter build apk --release
```
Este comando generará un archivo llamado `app-release.apk` en:
`build/app/outputs/flutter-apk/`

### Paso C: ¿Cómo distribuirla?
1. **Descarga Directa**: Sube el archivo `.apk` a tu VPS (ej: `https://tu-dominio.com/descarga/app.apk`) y comparte el enlace.
2. **Play Store**: Requiere una cuenta de desarrollador de Google ($25 USD pago único) y seguir el proceso de publicación oficial.

---

## 5. Gestión y Actualizaciones Post-Despliegue

### ¿Cómo aplicar cambios?
- **Backend**: Sube el archivo modificado y reinicia la aplicación desde el panel de Plesk.
- **Web**: Ejecuta `npm run build` en tu PC y sube de nuevo la carpeta `build`.
- **Móvil**: Si cambias algo de la interfaz, debes generar un nuevo APK y pedir a los usuarios que instalen la versión actualizada.

### Recomendación de Seguridad
> [!IMPORTANT]
> Nunca compartas el archivo `.env` en repositorios públicos. Asegúrate de que `node_modules` y carpetas de `build` estén en tu `.gitignore`.
