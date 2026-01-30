import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { Logger, ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import helmet from 'helmet';
import { AppModule } from './app.module';

export async function bootstrap() {
  const logger = new Logger('Bootstrap');

  const app = await NestFactory.create(AppModule);

  if (process.env['NODE_ENV'] !== 'test') {
    app.use(helmet());
  }

  // Enable CORS for all origins
  app.enableCors({
    origin: '*',
    credentials: false,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  app.useGlobalPipes(new ValidationPipe());

  // Set global API prefix
  app.setGlobalPrefix('api');

  const config = new DocumentBuilder()
    .setTitle('TechHaven Payment API')
    .setDescription('API for TechHaven payment onboarding')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
    },
  });

  const port = process.env['PORT'] ?? 3000;
  await app.listen(port);

  const url = await app.getUrl();
  const cleanUrl = url.replace('[::1]', 'localhost');

  logger.log('✅ Base de datos conectada y productos sembrados');
  logger.log(`🚀 Servidor corriendo en: ${cleanUrl}`);
  logger.log(`📚 Swagger disponible en: ${cleanUrl}/api`);
}

if (process.env['NODE_ENV'] !== 'test' && typeof jest === 'undefined') {
  bootstrap().catch(console.error);
}
