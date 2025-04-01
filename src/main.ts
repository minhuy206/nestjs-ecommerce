import { NestFactory } from '@nestjs/core'
import { AppModule } from './app.module'
import { configSwagger } from './configs/swagger.config'
import { patchNestJsSwagger } from 'nestjs-zod'

async function bootstrap() {
  const app = await NestFactory.create(AppModule)
  app.enableCors()
  patchNestJsSwagger()
  configSwagger(app)
  await app.listen(process.env.PORT ?? 3000)
}
bootstrap()
