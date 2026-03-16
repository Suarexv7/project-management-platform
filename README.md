# Project Management Platform

REST API backend para gestión de proyectos y tareas, construida con **NestJS**, **TypeORM** y **PostgreSQL**.

---

## Tabla de Contenidos

- [Descripción](#descripción)
- [Tecnologías](#tecnologías)
- [Arquitectura](#arquitectura)
- [Requisitos previos](#requisitos-previos)
- [Instalación](#instalación)
- [Variables de entorno](#variables-de-entorno)
- [Ejecutar la aplicación](#ejecutar-la-aplicación)
- [Documentación API (Swagger)](#documentación-api-swagger)
- [Endpoints](#endpoints)
- [Reglas de negocio](#reglas-de-negocio)
- [Tests](#tests)
- [Credenciales de prueba](#credenciales-de-prueba)

---

## Descripción

Plataforma backend para gestionar proyectos y sus tareas. Permite crear proyectos, asignarles tareas, controlar su estado mediante reglas de negocio y expone una API REST segura con autenticación JWT.

---

## Tecnologías

| Tecnología | Versión | Uso |
|---|---|---|
| Node.js | 18+ | Runtime |
| NestJS | 11 | Framework backend |
| TypeORM | 0.3 | ORM |
| PostgreSQL | 14+ | Base de datos |
| JWT + Passport | - | Autenticación |
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
 │   └── tasks
 │       ├── dto
 │       │   ├── create-task.dto.ts
 │       │   ├── update-task.dto.ts
 │       │   └── reorder-task.dto.ts
 │       ├── tasks.controller.ts
 │       ├── tasks.service.ts
 │       └── tasks.module.ts
 │
 ├── app.module.ts
 └── main.ts
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

# JWT
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

```
PATCH /api/projects/{id}/activate
```

### 2. Completar proyecto
Un proyecto solo puede completarse si:
- Todas sus tareas tienen `isCompleted: true`
- Su estado actual es `ACTIVE`

```
PATCH /api/projects/{id}/complete
```

### 3. Order único por proyecto
Al crear una tarea, el campo `order` debe ser único dentro del mismo proyecto. No pueden existir dos tareas con el mismo `order` en un proyecto.

### 4. Reordenamiento sin duplicados
Al reordenar una tarea, el sistema recalcula automáticamente el `order` de todas las tareas del proyecto para evitar duplicados.

### 5. Summary endpoint
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
$ npm install -g @nestjs/mau
$ mau deploy
```

With Mau, you can deploy your application in just a few clicks, allowing you to focus on building features rather than managing infrastructure.

## Resources

Check out a few resources that may come in handy when working with NestJS:

- Visit the [NestJS Documentation](https://docs.nestjs.com) to learn more about the framework.
- For questions and support, please visit our [Discord channel](https://discord.gg/G7Qnnhy).
- To dive deeper and get more hands-on experience, check out our official video [courses](https://courses.nestjs.com/).
- Deploy your application to AWS with the help of [NestJS Mau](https://mau.nestjs.com) in just a few clicks.
- Visualize your application graph and interact with the NestJS application in real-time using [NestJS Devtools](https://devtools.nestjs.com).
- Need help with your project (part-time to full-time)? Check out our official [enterprise support](https://enterprise.nestjs.com).
- To stay in the loop and get updates, follow us on [X](https://x.com/nestframework) and [LinkedIn](https://linkedin.com/company/nestjs).
- Looking for a job, or have a job to offer? Check out our official [Jobs board](https://jobs.nestjs.com).

## Support

Nest is an MIT-licensed open source project. It can grow thanks to the sponsors and support by the amazing backers. If you'd like to join them, please [read more here](https://docs.nestjs.com/support).

## Stay in touch

- Author - [Kamil Myśliwiec](https://twitter.com/kammysliwiec)
- Website - [https://nestjs.com](https://nestjs.com/)
- Twitter - [@nestframework](https://twitter.com/nestframework)

## License

Nest is [MIT licensed](https://github.com/nestjs/nest/blob/master/LICENSE).
