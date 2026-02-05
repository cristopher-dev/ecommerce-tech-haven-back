import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { Logger, ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import helmet from 'helmet';
import { AppModule } from './app.module';

export async function bootstrap() {
  const logger = new Logger('Bootstrap');

  const app = await NestFactory.create(AppModule);

  if (
    process.env['NODE_ENV'] !== 'test' &&
    process.env['NODE_ENV'] !== 'development'
  ) {
    app.use(helmet());
  }

  // Enable CORS with environment-based origins
  const allowedOrigins = process.env['ALLOWED_ORIGINS']
    ? process.env['ALLOWED_ORIGINS'].split(',').map((origin) => origin.trim())
    : ['*'];

  app.enableCors({
    origin: (
      origin: string | undefined,
      callback: (err: Error | null, allow?: boolean) => void,
    ) => {
      if (
        !origin ||
        origin === 'null' ||
        allowedOrigins.includes('*') ||
        allowedOrigins.includes(origin)
      ) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    exposedHeaders: ['X-Total-Count', 'X-Page-Count'],
    maxAge: 3600,
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
  logger.log(`📚 Swagger disponible en: ${cleanUrl}/api/docs`);
}

if (process.env['NODE_ENV'] !== 'test' && typeof jest === 'undefined') {
  bootstrap().catch(console.error);
}
