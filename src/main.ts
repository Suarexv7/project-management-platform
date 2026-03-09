import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common'; // 1. Importación necesaria

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  //Prefijo global para todas las rutas
  app.setGlobalPrefix('api');

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