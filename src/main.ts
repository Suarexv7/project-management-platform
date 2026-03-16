import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common'; // 1. Importación necesaria
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import { engine } from 'express-handlebars';
const session = require('express-session');

async function bootstrap() {
  // 1. Cambiamos el tipo a NestExpressApplication para poder configurar vistas
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // Configurar express-handlebars con layout y helpers
  app.engine('hbs', engine({
    extname: '.hbs',
    defaultLayout: 'main',
    layoutsDir: join(__dirname, '..', 'views/layouts'),
    helpers: {
      eq: (a: any, b: any) => a === b,
    }
  }));

  // 2. Le decimos dónde están las vistas (carpeta views en la raíz)
  app.setBaseViewsDir(join(__dirname, '..', 'views'));

  // 3. Le decimos dónde están los archivos estáticos (CSS, imágenes)
  app.useStaticAssets(join(__dirname, '..', 'public'));

  // 4. Le decimos que use Handlebars como motor de plantillas
  app.setViewEngine('hbs');

  // Configurar sesiones
  app.use(session({
    secret: 'mi_secreto_de_sesion',
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 24 * 60 * 60 * 1000 } // 24 horas
  }));

  //Prefijo global para todas las rutas
  app.setGlobalPrefix('api', {
    exclude: ['web/(.*)'],
  });

  // 2. Activación global de validaciones
  // whitelist: true descarta propiedades que no estén en el DTO
  // forbidNonWhitelisted: lanza error si envían propiedades extra
  // transform: convierte los payloads a instancias de las clases DTO
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
  }));

  // Configuración de Swagger
  const config = new DocumentBuilder()
    .setTitle('Project Management API')
    .setDescription('API documentation for the Project Management Platform')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document);

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();