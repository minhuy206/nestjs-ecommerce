import { createZodDto } from 'nestjs-zod'
import {
  CreateLanguageBodySchema,
  GetLanguageParamsSchema,
  GetLanguagesResponseSchema,
  LanguageSchema,
  UpdateLanguageBodySchema,
} from './language.entity'

export class CreateLanguageBodyDTO extends createZodDto(CreateLanguageBodySchema) {}

export class GetLanguageParamsDTO extends createZodDto(GetLanguageParamsSchema) {}

export class GetLanguagesResponseDTO extends createZodDto(GetLanguagesResponseSchema) {}

export class UpdateLanguageBodyDTO extends createZodDto(UpdateLanguageBodySchema) {}

export class GetLanguageDetailResponseDTO extends createZodDto(LanguageSchema) {}
