# Project Management Platform

Backend monolítico construido con **NestJS**, **TypeORM** y **PostgreSQL** que expone una **API REST** y una **interfaz web SSR** compartiendo exactamente la misma lógica de negocio.

---

## Tabla de Contenidos

- [Descripción](#descripción)
- [Tecnologías](#tecnologías)
- [Arquitectura](#arquitectura)
- [Requisitos previos](#requisitos-previos)
- [Instalación](#instalación)
- [Variables de entorno](#variables-de-entorno)
- [Ejecutar la aplicación](#ejecutar-la-aplicación)
- [Interfaz Web](#interfaz-web)
- [Documentación API (Swagger)](#documentación-api-swagger)
- [Endpoints](#endpoints)
- [Reglas de negocio](#reglas-de-negocio)
- [Tests](#tests)
- [Credenciales de prueba](#credenciales-de-prueba)
- [Modelo de datos](#modelo-de-datos)

---

## Descripción

Plataforma para gestionar proyectos y sus tareas. El sistema permite:

- Crear y gestionar proyectos con estados controlados (`Draft → Active → Completed`)
- Asignar tareas a proyectos con prioridades y orden único
- Controlar el flujo de trabajo mediante reglas de negocio estrictas
- Acceder mediante una **API REST** con autenticación JWT
- Acceder mediante una **interfaz web** con autenticación por sesiones

> La interfaz web **NO consume la API vía HTTP**. Tanto los controllers web como los controllers REST consumen los **mismos servicios**, garantizando que la lógica de negocio no se duplique.

---

## Tecnologías

| Tecnología | Versión | Uso |
|---|---|---|
| Node.js | 18+ | Runtime |
| NestJS | 11 | Framework backend |
| TypeORM | 0.3 | ORM |
| PostgreSQL | 14+ | Base de datos |
| JWT + Passport | - | Autenticación API REST |
| express-session | - | Autenticación interfaz web |
| Handlebars (hbs) | - | Motor de plantillas SSR |
| Bootstrap | 5.3 | Estilos interfaz web |
| Swagger | 11 | Documentación API |
| Jest | 30 | Tests unitarios |
| bcrypt | 6 | Encriptación de contraseñas |
| class-validator | 0.15 | Validación de DTOs |

---

## Arquitectura

El proyecto sigue una arquitectura modular inspirada en **Clean Architecture**:

```
src
 ├── domain
 │   └── entities
 │       ├── project.entity.ts      # Entidad Project con enum ProjectStatus
 │       ├── task.entity.ts         # Entidad TaskItem con enum Priority
 │       └── user.entity.ts         # Entidad User para autenticación
 │
 ├── modules
 │   ├── auth
 │   │   ├── dto
 │   │   │   ├── register.dto.ts
 │   │   │   └── login.dto.ts
 │   │   ├── strategies
 │   │   │   └── jwt-auth.strategy.ts
 │   │   ├── auth.controller.ts
 │   │   ├── auth.service.ts
 │   │   └── auth.module.ts
 │   │
 │   ├── projects
 │   │   ├── dto
 │   │   │   ├── create-project.dto.ts
 │   │   │   └── update-project.dto.ts
 │   │   ├── projects.controller.ts
 │   │   ├── projects.service.ts
 │   │   └── projects.module.ts
 │   │
 │   ├── tasks
 │   │   ├── dto
 │   │   │   ├── create-task.dto.ts
 │   │   │   ├── update-task.dto.ts
 │   │   │   └── reorder-task.dto.ts
 │   │   ├── tasks.controller.ts
 │   │   ├── tasks.service.ts
 │   │   └── tasks.module.ts
 │   │
 │   └── web
 │       ├── web.controller.ts      # Controller SSR — consume los mismos servicios
 │       └── web.module.ts
 │
 ├── app.module.ts
 └── main.ts

views                               # Plantillas Handlebars
 ├── layouts
 │   └── main.hbs                   # Layout principal con navbar
 ├── auth
 │   ├── login.hbs
 │   └── register.hbs
 ├── projects
 │   ├── index.hbs                  # Lista de proyectos
 │   ├── detail.hbs                 # Detalle con tareas
 │   ├── new.hbs                    # Formulario crear
 │   └── edit.hbs                   # Formulario editar
 └── tasks
     └── edit.hbs                   # Formulario editar tarea

public                              # Archivos estáticos CSS/JS
```

---

## Requisitos previos

Asegúrate de tener instalado:

- [Node.js](https://nodejs.org/) v18 o superior
- [PostgreSQL](https://www.postgresql.org/) v14 o superior
- [npm](https://www.npmjs.com/) v9 o superior

---

## Instalación

### 1. Clonar el repositorio

```bash
git clone https://github.com/TU_USUARIO/project-management-platform.git
cd project-management-platform
```

### 2. Instalar dependencias

```bash
npm install
```

### 3. Crear la base de datos en PostgreSQL

Abre tu cliente de PostgreSQL (psql o pgAdmin) y ejecuta:

```sql
CREATE DATABASE project_management;
```

### 4. Configurar variables de entorno

Crea un archivo `.env` en la raíz del proyecto (ver sección [Variables de entorno](#variables-de-entorno)).

---

## Variables de entorno

Crea un archivo `.env` en la raíz del proyecto con el siguiente contenido:

```env
# Base de datos
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
POSTGRES_USER=postgres
POSTGRES_PASSWORD=tu_contraseña
POSTGRES_DB=project_management

# JWT (para la API REST)
JWT_SECRET=este_es_un_secreto_muy_largo_y_seguro_2024
JWT_EXPIRES_IN=24h
```

> ⚠️ **Importante:** Nunca subas el archivo `.env` a Git. Ya está incluido en `.gitignore`.

---

## Ejecutar la aplicación

### Modo desarrollo (con hot reload)

```bash
npm run start:dev
```

### Modo producción

```bash
npm run build
npm run start:prod
```

La aplicación estará disponible en:

```
http://localhost:3000
```

> Las tablas se crean automáticamente gracias a `synchronize: true` en TypeORM. No se necesitan migraciones en desarrollo.

---

## Interfaz Web

La interfaz web está disponible en:

```
http://localhost:3000/web/projects
```

> Si no has iniciado sesión, serás redirigido automáticamente al login.

### Páginas disponibles

| URL | Descripción |
|---|---|
| `/web/auth/login` | Iniciar sesión |
| `/web/auth/register` | Registrarse |
| `/web/projects` | Lista de proyectos |
| `/web/projects/new` | Crear proyecto |
| `/web/projects/:id` | Detalle del proyecto con tareas |
| `/web/projects/:id/edit` | Editar proyecto |
| `/web/tasks/:id/edit` | Editar tarea |
| `/web/auth/logout` | Cerrar sesión |

### Funcionalidades de la interfaz web

**Proyectos:**
- Ver todos los proyectos con su estado
- Crear nuevo proyecto
- Editar nombre y descripción
- Activar proyecto (requiere al menos una tarea)
- Completar proyecto (requiere todas las tareas completadas)
- Eliminar proyecto (elimina también sus tareas en cascada)

**Tareas:**
- Ver tareas ordenadas por `order`
- Agregar nueva tarea con título, prioridad y order
- Editar título y prioridad
- Marcar como completada
- Eliminar tarea

### Flujo recomendado en la interfaz web

1. Ir a `/web/auth/register` y crear una cuenta
2. Iniciar sesión con tus credenciales
3. Crear un proyecto desde el botón **+ Nuevo Proyecto**
4. Entrar al detalle del proyecto
5. Agregar al menos una tarea
6. Activar el proyecto con **✅ Activar proyecto**
7. Completar las tareas con **✔**
8. Completar el proyecto con **🏁 Completar proyecto**

---

## Documentación API (Swagger)

Una vez que la aplicación esté corriendo, accede a la documentación interactiva en:

```
http://localhost:3000/docs
```

### Cómo autenticarse en Swagger

1. Registra un usuario con `POST /api/auth/register`
2. Haz login con `POST /api/auth/login` y copia el `access_token`
3. Click en el botón **Authorize** 🔓 en la esquina superior derecha
4. Pega el token y click en **Authorize**
5. Ahora puedes usar todos los endpoints protegidos

---

## Endpoints

### Autenticación (sin seguridad)

| Método | Endpoint | Descripción |
|---|---|---|
| POST | `/api/auth/register` | Registrar nuevo usuario |
| POST | `/api/auth/login` | Iniciar sesión y obtener token JWT |

### Proyectos (requieren JWT)

| Método | Endpoint | Descripción |
|---|---|---|
| GET | `/api/projects/search?status=&page=&pageSize=` | Listar proyectos con paginación y filtro |
| POST | `/api/projects` | Crear proyecto |
| PUT | `/api/projects/{id}` | Actualizar proyecto |
| DELETE | `/api/projects/{id}` | Eliminar proyecto |
| PATCH | `/api/projects/{id}/activate` | Activar proyecto |
| PATCH | `/api/projects/{id}/complete` | Completar proyecto |
| GET | `/api/projects/{id}/summary` | Resumen del proyecto |

### Tareas (requieren JWT)

| Método | Endpoint | Descripción |
|---|---|---|
| POST | `/api/projects/{projectId}/tasks` | Crear tarea en un proyecto |
| GET | `/api/projects/{projectId}/tasks` | Listar tareas de un proyecto |
| PUT | `/api/tasks/{id}` | Actualizar tarea |
| DELETE | `/api/tasks/{id}` | Eliminar tarea |
| PATCH | `/api/tasks/{id}/complete` | Marcar tarea como completada |
| PATCH | `/api/tasks/{id}/reorder` | Reordenar tarea dentro del proyecto |

---

## Reglas de negocio

Las siguientes reglas están implementadas en la capa de servicios, no en los controllers:

### 1. Activar proyecto
Un proyecto solo puede activarse si:
- Tiene al menos una tarea asociada
- Su estado actual es `DRAFT`

### 2. Completar proyecto
Un proyecto solo puede completarse si:
- Todas sus tareas tienen `isCompleted: true`
- Su estado actual es `ACTIVE`

### 3. Order único por proyecto
Al crear una tarea, el campo `order` debe ser único dentro del mismo proyecto.

### 4. Reordenamiento sin duplicados
Al reordenar una tarea, el sistema recalcula automáticamente el `order` de todas las tareas del proyecto para evitar duplicados.

### 5. Eliminar proyecto en cascada
Al eliminar un proyecto, se eliminan automáticamente todas sus tareas asociadas.

### 6. Summary endpoint
Devuelve información calculada del proyecto:

```json
{
  "id": 1,
  "name": "Website Redesign",
  "status": "active",
  "totalTasks": 8,
  "completedTasks": 5
}
```

---

## Tests

### Ejecutar todos los tests

```bash
npm run test
```

### Ejecutar tests con cobertura

```bash
npm run test:cov
```

### Tests implementados

| Test | Descripción |
|---|---|
| `ActivateProject_WithTasks_ShouldSucceed` | Activar proyecto con tareas debe funcionar |
| `ActivateProject_WithoutTasks_ShouldFail` | No debe activarse sin tareas |
| `CompleteProject_WithPendingTasks_ShouldFail` | No debe completarse con tareas pendientes |
| `CreateTask_WithDuplicateOrder_ShouldFail` | No permite order duplicado en el mismo proyecto |
| `DeleteProject_ShouldBeDelete` | Eliminar proyecto debe funcionar correctamente |

Todos los tests son **unitarios**, usan **mocks** de los repositorios y no requieren base de datos.

---

## Credenciales de prueba

Puedes registrar un usuario directamente desde la interfaz web en `/web/auth/register` o desde Swagger:

```json
{
  "email": "admin@test.com",
  "password": "123456",
  "name": "Admin User"
}
```

---

## Modelo de datos

### Project

| Campo | Tipo | Descripción |
|---|---|---|
| id | number | Identificador único |
| name | string | Nombre del proyecto (max 255) |
| description | string (opcional) | Descripción |
| status | enum | `draft` \| `active` \| `completed` |
| createdAt | Date | Fecha de creación (automática) |
| updatedAt | Date | Fecha de actualización (automática) |

### TaskItem

| Campo | Tipo | Descripción |
|---|---|---|
| id | number | Identificador único |
| title | string | Título de la tarea (max 150) |
| priority | enum | `low` \| `medium` \| `high` |
| order | number | Posición única dentro del proyecto |
| isCompleted | boolean | Estado de completado (default: false) |
| projectId | number | ID del proyecto al que pertenece |

### User

| Campo | Tipo | Descripción |
|---|---|---|
| id | number | Identificador único |
| name | string | Nombre del usuario |
| email | string | Email único |
| password | string | Contraseña encriptada con bcrypt |
| createdAt | Date | Fecha de creación (automática) |

---

## Autor

Desarrollado como parte de un assessment técnico de NestJS.
