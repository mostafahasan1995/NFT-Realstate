import { INestApplication } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

export function setupSwagger(app: INestApplication) {
  if (process.env.NODE_ENV !== 'production') {
    const config = new DocumentBuilder()
      .setTitle('Gamma cities API')
      .setDescription('Gamma cities API description')
      .setVersion('1.0')
      .addBearerAuth()
      .addApiKey(
        {
          type: 'apiKey',
          name: 'x-api-key',
          in: 'header',
        },
        'apiKey'
      )
      .addServer('https://api.gammacities.com/api', 'Production')
      .addServer('https://xyz.gammacities.com/api', 'Testing')
      .addServer('http://localhost:3000/api', 'Dev')
      .build();
    const document = SwaggerModule.createDocument(app, config, {
      ignoreGlobalPrefix: true,
    });
    SwaggerModule.setup('api/docs', app, document);
  }
}
