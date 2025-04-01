import { createZodDto } from 'nestjs-zod'
import { MessageResponseSchema } from '../entities/response.entites'

export class MessageResponseDTO extends createZodDto(MessageResponseSchema) {}
