import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { Logger } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';

export async function bootstrap() {
  const logger = new Logger('Bootstrap');

  const app = await NestFactory.create(AppModule);

  // Swagger setup
  const config = new DocumentBuilder()
    .setTitle('Wompi Payment API')
    .setDescription('API for Wompi payment onboarding')
    .setVersion('1.0')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  await app.listen(process.env.PORT ?? 3000);
  const url = await app.getUrl();

  logger.log('✅ Base de datos conectada y productos sembrados');
  logger.log(`🚀 Servidor corriendo en: ${url}`);
  logger.log(`📚 Swagger disponible en: ${url}/api`);
}

// Only bootstrap in non-test environments
if (process.env.NODE_ENV !== 'test' && typeof jest === 'undefined') {
  bootstrap().catch(console.error);
}
