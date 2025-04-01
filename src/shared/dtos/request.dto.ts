import { createZodDto } from 'nestjs-zod'
import { EmptyBodySchema } from '../entities/request.entites'

export class EmptyBodyDTO extends createZodDto(EmptyBodySchema) {}
