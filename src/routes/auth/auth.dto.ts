import { createZodDto } from 'nestjs-zod'
import {
  LoginBodySchema,
  LoginResponseSchema,
  LogoutBodySchema,
  RefreshTokenBodySchema,
  RefreshTokenResponseSchema,
  RegisterBodySchema,
  RegisterResponseSchema,
  SendOTPBodySchema,
} from './auth.model'

export class RegisterBodyDto extends createZodDto(RegisterBodySchema) {}

export class RegisterResponseDto extends createZodDto(RegisterResponseSchema) {}

export class SendOTPBodyDTO extends createZodDto(SendOTPBodySchema) {}

export class LoginBodyDTO extends createZodDto(LoginBodySchema) {}

export class LoginResponseDTO extends createZodDto(LoginResponseSchema) {}

export class RefreshTokenBodyDTO extends createZodDto(RefreshTokenBodySchema) {}

export class RefreshTokenResponseDTO extends createZodDto(RefreshTokenResponseSchema) {}

export class LogoutBodyDTO extends createZodDto(LogoutBodySchema) {}
