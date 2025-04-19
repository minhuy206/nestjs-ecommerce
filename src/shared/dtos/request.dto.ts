import { createZodDto } from 'nestjs-zod'
import { EmptyBodySchema } from '../models/request.model'

export class EmptyBodyDTO extends createZodDto(EmptyBodySchema) {}
