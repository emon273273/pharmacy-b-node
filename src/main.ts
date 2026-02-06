import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import helmet from 'helmet';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Security middleware (equivalent to helmet)
  app.use(helmet());
  
  // Enable CORS
  app.enableCors();
  
  // Global validation pipe
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
  }));
  
  // Server Listen
  const PORT = process.env.PORT || 3000;
  await app.listen(PORT);
  
  console.log(`Server is running on port ${PORT}`);
}

bootstrap();
