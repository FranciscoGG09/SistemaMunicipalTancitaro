# 🏛️ Sistema Integral - Gobierno Municipal de Tancítaro

<p align="center">
  <img src="https://img.shields.io/badge/Estado-Desplegado_(Producción_2022_2024)-blue" alt="Estado del Proyecto">
  <img src="https://img.shields.io/badge/PHP-777BB4?style=flat&logo=php&logoColor=white" alt="PHP">
  <img src="https://img.shields.io/badge/JavaScript-F7DF1E?style=flat&logo=javascript&logoColor=black" alt="JavaScript">
  <img src="https://img.shields.io/badge/SQL-4479A1?style=flat&logo=mysql&logoColor=white" alt="SQL">
  <img src="https://img.shields.io/badge/HTML5-E34F26?style=flat&logo=html5&logoColor=white" alt="HTML5">
  <img src="https://img.shields.io/badge/CSS3-1572B6?style=flat&logo=css3&logoColor=white" alt="CSS3">
</p>

Plataforma web integral desarrollada y desplegada para el **Gobierno Municipal de Tancítaro (2021-2024)**. Este proyecto fue una solución real implementada durante mi rol como Auxiliar de TI, diseñada para modernizar la administración pública, automatizar procesos internos y mejorar la transparencia y el acceso a la información para los ciudadanos.

El desarrollo de esta plataforma tuvo un impacto medible en la organización:
* **Mejora del 50%** en el acceso ciudadano a la información a través del portal web.
* **Reducción del 30%** en errores de captura mediante la automatización de análisis de información institucional.
* Digitalización completa del sistema de declaraciones patrimoniales.

## 📋 Módulos y Características

El sistema se compone de varios módulos clave:

### 1. Portal Ciudadano (Frontend)
* Interfaz pública desarrollada con PHP y JavaScript.
* Sección de noticias, trámites y servicios.
* Diseño responsive para acceso desde dispositivos móviles.
* Mejoró el acceso a la información pública para los ciudadanos.

### 2. Sistema de Declaraciones Patrimoniales
* Módulo seguro con inicio de sesión para funcionarios.
* Formularios dinámicos construidos con HTML, CSS y JavaScript para la captura de información.
* Validación de datos del lado del servidor (PHP) y cliente (JS).
* Almacenamiento seguro en base de datos SQL.

### 3. Sistema de Automatización Interna
* Panel de administración para la captura y análisis de información institucional.
* Generación de reportes y métricas de desempeño.
* Base de datos SQL centralizada para automatizar procesos y reducir errores manuales.

## 🛠️ Stack Tecnológico

* **Backend:** **PHP**
* **Frontend:** **HTML5**, **CSS3** y **JavaScript (Vanilla)**
* **Base de Datos:** **SQL** (MySQL / PostgreSQL)
* **Arquitectura:** Modelo-Vista-Controlador (MVC)
* **Servidor:** Desplegado en un servidor local (Apache/Linux) dentro de la infraestructura del gobierno municipal.

## ⚠️ Nota de Confidencialidad y Despliegue

Dado que este fue un sistema desarrollado para una entidad gubernamental, el código en este repositorio es una **versión de demostración (demo) o *legacy***.

* **No se incluye la base de datos** con datos reales para proteger la privacidad y seguridad de la información municipal.
* **Credenciales y *endpoints*** de la base de datos han sido omitidos/modificados.

### Ejecución Local (Demostración)

Para ejecutar una versión de demostración:

1.  **Clonar el repositorio:**
    ```bash
    git clone [https://github.com/FranciscoGG09/SistemaMunicipalTancitaro.git](https://github.com/FranciscoGG09/SistemaMunicipalTancitaro.git)
    cd SistemaMunicipalTancitaro
    ```

2.  **Configurar el Servidor Local:**
    * Mover la carpeta del proyecto a tu directorio `htdocs` (XAMPP) o `www` (WAMP/MAMP).

3.  **Base de Datos:**
    * Se necesitaría crear una base de datos SQL local (`.sql` no provisto por seguridad) y configurar las credenciales en el archivo de conexión (ej. `includes/db.php` o similar).

4.  **Acceder:**
    * Inicia tu servidor Apache y MySQL.
    * Accede a `http://localhost/SistemaMunicipalTancitaro` en tu navegador.

## 👨‍💻 Autor

Desarrollado por **Francisco González** durante mi cargo como Auxiliar de TI en el Gobierno Municipal de Tancítaro (2022-2024).

* **LinkedIn:** [linkedin.com/in/francisco-gonzalez](https://linkedin.com/in/francisco-gonzalez)
* **GitHub:** [@FranciscoGG09](https://github.com/FranciscoGG09)
