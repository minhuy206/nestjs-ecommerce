import { INestApplication } from '@nestjs/common'
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger'
export function configSwagger(app: INestApplication) {
  const config = new DocumentBuilder()
    .setTitle('NestJS Ecommerce API Documentation')
    .setDescription(
      'This is a Ecommerce API. A back-end API for an ecommerce application built with NestJS. It provides endpoints for user authentication, product management, order processing, and more. \n\nSome useful links:\n\n- [NestJS Ecommerce repository](https://github.com/minhuy206/nestjs-ecommerce)',
    )
    .setContact('the developer', '', 'contact@minhuy.dev')
    .setExternalDoc('Find out more ablout NestJS', 'https://nestjs.com')
    .setVersion('1.0')
    .addBearerAuth()
    .addGlobalResponse({
      status: 500,
      description: 'Internal server error',
    })
    .build()
  const document = SwaggerModule.createDocument(app, config)
  SwaggerModule.setup('api-docs', app, document, {
    swaggerOptions: { persistAuthorization: true },
  })
}
