import { HttpAdapterHost, NestFactory } from '@nestjs/core';
import { Logger, ValidationPipe } from '@nestjs/common';
import helmet from 'helmet';
import { AppModule } from './app/app.module';
import { MultiplayerGateway } from './multiplayer/multiplayer.gateway';
import { SentryExceptionFilter } from './sentry/sentry-exception.filter';
import { setupSwagger } from './swagger/swagger';

async function bootstrap() {
  const port = process.env.PORT || 3000;
  const globalPrefix = 'api';

  const app = await NestFactory.create(AppModule);

  const { httpAdapter } = app.get(HttpAdapterHost);
  app.useGlobalFilters(new SentryExceptionFilter(httpAdapter));
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
    })
  );
  app.use(helmet());
  app.setGlobalPrefix(globalPrefix);
  app.enableCors({
    origin: [
      'https://gammacities.com',
      'https://gammaassets.com',
      /\.gammacities\.com$/,
      /\.gammaassets\.com$/,
      /\.vagon\.io$/,
      'http://localhost:3000',
    ],
    credentials: true,
  });

  // Swagger config
  // setupSwagger(app);

  // This is commented out because it's not needed in the current state of the app
  // Initialize ws
  // const server = app.getHttpServer();
  // const websocketService = app.get(MultiplayerGateway);
  // websocketService.initialize(server);

  await app.listen(port);
  Logger.log(
    `🚀 Application is running on: http://localhost:${port}/${globalPrefix}`
  );
}
bootstrap();

