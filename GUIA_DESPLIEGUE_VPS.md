# Guía de Despliegue VPS - Sistema Municipal Tancítaro

Esta guía detalla los pasos para desplegar el proyecto en un servidor VPS (Ubuntu/Debian recomendado).

## 1. Prerrequisitos del Servidor
Asegúrate de tener instalado lo siguiente en tu VPS:
- **Node.js** (versión 18 o superior)
- **PostgreSQL** (versión 14 o superior)
- **Git**
- **PM2** (para mantener la aplicación corriendo: `npm install -g pm2`)

### Extensiones de Base de Datos
La base de datos requiere extensiones específicas. Asegúrate de instalarlas en tu servidor Postgres:
```bash
sudo apt install postgresql-xx-postgis  # Reemplaza xx con tu versión (ej. 16)
```

## 2. Preparación del Proyecto

1. **Clonar el repositorio**:
   ```bash
   git clone <url-de-tu-repo>
   cd SistemaMunicipalTancitaro
   ```

2. **Configuración del Backend**:
   ```bash
   cd backend
   cp .env.example .env
   nano .env  # Edita las variables con tus datos reales (DB_PASSWORD, etc.)
   npm install
   ```

3. **Inicialización de Base de Datos**:
   Asegúrate que la base de datos `tancitaro_db` (o el nombre que hayas puesto en .env) exista.
   ```bash
   # Crear base de datos si no existe
   createdb -U postgres tancitaro_db
   
   # Ejecutar script de inicialización (crea tablas y admin)
   npm run db:create
   ```

4. **Configuración del Frontend**:
   ```bash
   cd ../frontend
   cp .env.example .env
   nano .env
   # Asegúrate de poner REACT_APP_API_URL=https://tu-dominio.com/api (o la IP del VPS)
   npm install
   npm run build
   ```
   Esto generará una carpeta `build` con los archivos estáticos.

## 3. Puesta en Marcha

### Opción A: Usando PM2 para el Backend
```bash
cd ../backend
pm2 start server.js --name "tancitaro-backend"
pm2 save
pm2 startup
```

### Opción B: Servir Frontend (Recomendado: Nginx)
Instala Nginx y configuralo como proxy inverso.
1. `sudo apt install nginx`
2. Configura un archivo en `/etc/nginx/sites-available/tancitaro`:
   ```nginx
   server {
       listen 80;
       server_name tu-dominio.com;

       # Frontend (Archivos estáticos)
       location / {
           root /ruta/al/proyecto/frontend/build;
           index index.html index.htm;
           try_files $uri $uri/ /index.html;
       }

       # Backend (API)
       location /api {
           proxy_pass http://localhost:3000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```
3. Activa el sitio: `sudo ln -s /etc/nginx/sites-available/tancitaro /etc/nginx/sites-enabled/`
4. Reinicia Nginx: `sudo systemctl restart nginx`

## 4. Gestión de Base de Datos (Backup y Restauración)

Si tienes un archivo de respaldo (backup) de tu base de datos local (ej. `respaldo.sql`), sigue estos pasos para subirlo y restaurarlo:

### 1. Subir el archivo al VPS
Desde tu computadora local (Windows), usa `scp` en la terminal (PowerShell/CMD) o un programa como **WinSCP** o **FileZilla**.

**Comando SCP:**
```powershell
# Reemplaza 'usuario' e 'ip-del-vps' con tus datos reales
scp ruta\a\tu\respaldo.sql usuario@ip-del-vps:/home/usuario/
```

### 2. Restaurar en el VPS
Una vez conectado al VPS por SSH:

```bash
# Si database ya existe y quieres limpiarla primero (OPCIONAL):
# dropdb -U postgres tancitaro_db
# createdb -U postgres tancitaro_db

# Restaurar el archivo .sql
psql -U postgres -d tancitaro_db -f /home/usuario/respaldo.sql
```
*Si tienes errores de permisos con el usuario postgres, prueba usando `sudo -u postgres psql ...`*

## 5. Verificación
- Visita `http://tu-dominio.com` para ver la aplicación.
- Intenta iniciar sesión con el usuario admin por defecto (ver `backend/utils/database.js` o logs de inicialización).
