import { createZodDto } from 'nestjs-zod'
import { RegisterBodySchema, RegisterResponseSchema, SendOTPBodySchema } from './auth.model'

export class RegisterBodyDto extends createZodDto(RegisterBodySchema) {}

export class RegisterResponseDto extends createZodDto(RegisterResponseSchema) {}

export class SendOTPBodyDTO extends createZodDto(SendOTPBodySchema) {}
