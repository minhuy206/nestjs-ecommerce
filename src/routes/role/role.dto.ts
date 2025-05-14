import { createZodDto } from 'nestjs-zod'
import {
  CreateRoleBodySchema,
  CreateRoleResponseSchema,
  GetRoleDetailResponseSchema,
  GetRoleParamsSchema,
  GetRolesQuerySchema,
  GetRolesResponseSchema,
  UpdateRoleBodySchema,
} from './role.model'

export class GetRolesResponseDTO extends createZodDto(GetRolesResponseSchema) {}

export class GetRoleParamsDTO extends createZodDto(GetRoleParamsSchema) {}

export class GetRoleDetailResponseDTO extends createZodDto(GetRoleDetailResponseSchema) {}

export class CreateRoleBodyDTO extends createZodDto(CreateRoleBodySchema) {}

export class CreateRoleResponseDTO extends createZodDto(CreateRoleResponseSchema) {}

export class UpdateRoleBodyDTO extends createZodDto(UpdateRoleBodySchema) {}

export class GetRolesQueryDTO extends createZodDto(GetRolesQuerySchema) {}
