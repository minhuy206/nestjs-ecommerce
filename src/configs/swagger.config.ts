import { INestApplication } from '@nestjs/common'
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger'
export function configSwagger(app: INestApplication) {
  const config = new DocumentBuilder()
    .setTitle('NestJS Ecommerce API Documentation')
    .setDescription(
      'This back-end project is a RESTful API for a multilingual ecommerce platform built using NestJS and PostgreSQL. It follows a modular and service-oriented architecture, ensuring scalability and maintainability. The API manages user authentication, product inventory, orders, and payments while implementing security best practices.\n\nSome useful links:\n\n- [NestJS Ecommerce repository](https://github.com/minhuy206/nestjs-ecommerce)',
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
