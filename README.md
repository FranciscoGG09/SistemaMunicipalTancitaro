# Sistema Municipal Tancítaro

Sistema integral de gestión municipal para optimizar procesos, reportes ciudadanos y comunicación interna.

## 🚀 Características

### Backend (Node.js + Express + PostgreSQL)
- **API RESTful** con arquitectura escalable
- **Autenticación JWT** con roles (admin, trabajador, ciudadano)
- **Base de datos PostgreSQL** con PostGIS para geolocalización
- **Subida de archivos** con Multer y Cloudinary
- **Validación de datos** con express-validator
- **Sistema de correos** interno y notificaciones
- **Documentación API** con ejemplos

### Frontend (React.js - En desarrollo)
- **Dashboard administrativo** para trabajadores municipales
- **Gestión de reportes** con mapas interactivos
- **Publicación de noticias** con editor enriquecido
- **Sistema de correo interno**
- **Interfaz responsive** y moderna

### App Móvil (Flutter - Próximamente)
- **Reportes ciudadanos** con GPS y cámara
- **Noticias en tiempo real**
- **Sincronización offline**

## 📁 Estructura del Proyecto
SistemaMunicipalTancitaro/
├── 📂 backend/ # API Node.js
│ ├── 📂 config/ # Configuración (DB, Cloudinary)
│ ├── 📂 controllers/ # Lógica de endpoints
│ ├── 📂 middleware/ # Auth, validación, upload
│ ├── 📂 models/ # Modelos de base de datos
│ ├── 📂 routes/ # Definición de rutas
│ ├── 📂 utils/ # Utilidades (DB, emails, etc.)
│ ├── 📄 .env # Variables de entorno
│ ├── 📄 package.json
│ └── 📄 server.js # Punto de entrada
├── 📂 frontend/ # Aplicación React (próximamente)
│ ├── 📂 public/
│ ├── 📂 src/
│ │ ├── 📂 components/ # Componentes reutilizables
│ │ ├── 📂 pages/ # Vistas principales
│ │ ├── 📂 services/ # Conexión con API
│ │ ├── 📂 context/ # Estado global
│ │ └── 📄 App.jsx
│ └── 📄 package.json
├── 📂 docs/ # Documentación
├── 📄 .gitignore
└── 📄 README.md