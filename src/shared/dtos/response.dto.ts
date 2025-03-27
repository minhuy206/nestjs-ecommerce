import { createZodDto } from 'nestjs-zod'
import { MessageResponseSchema } from '../models/response.model'

export class MessageResponseDTO extends createZodDto(MessageResponseSchema) {}
