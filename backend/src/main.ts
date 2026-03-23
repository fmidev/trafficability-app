import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { Request, Response, NextFunction } from 'express';
import * as dotbev from 'dotenv';

dotbev.config();

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);
  const frontendUrl =
    process.env.NODE_ENV === 'production'
      ? configService.get('FRONTEND_URL')
      : 'http://localhost:5173';

  app.enableCors({
    origin: frontendUrl,
    methods: 'GET,POST,PUT,DELETE',
    credentials: true,
  });

  // Logging middleware
  app.use((req: Request, res: Response, next: NextFunction) => {
    console.log(`${req.method} ${req.url}`);
    next();
  });

  await app.listen(3000);
}
bootstrap();
