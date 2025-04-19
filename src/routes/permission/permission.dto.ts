import { createZodDto } from 'nestjs-zod'
import {
  GetPermissionsResponseSchema,
  GetPermissionParamsSchema,
  GetPermissionDetailResponseSchema,
  CreatePermissionBodySchema,
  UpdatePermissionBodySchema,
  GetPermissionsQuerySchema,
} from './permission.model'

export class GetPermissionsResponseDTO extends createZodDto(GetPermissionsResponseSchema) {}

export class GetPermissionParamsDTO extends createZodDto(GetPermissionParamsSchema) {}

export class GetPermissionDetailResponseDTO extends createZodDto(GetPermissionDetailResponseSchema) {}

export class CreatePermissionBodyDTO extends createZodDto(CreatePermissionBodySchema) {}

export class UpdatePermissionBodyDTO extends createZodDto(UpdatePermissionBodySchema) {}

export class GetPermissionsQueryDTO extends createZodDto(GetPermissionsQuerySchema) {}
