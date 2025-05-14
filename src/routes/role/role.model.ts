import { PermissionSchema } from 'src/shared/models/shared-permission.model'
import { z } from 'zod'
import { RoleSchema } from '../auth/auth.model'

export const RoleWithPermissionsSchema = RoleSchema.extend({
  permissions: z.array(PermissionSchema),
})

export const GetRolesResponseSchema = z.object({
  data: z.array(RoleSchema),
  totalItems: z.number(),
  page: z.number(),
  limit: z.number(),
  totalPages: z.number(),
})

export const GetRolesQuerySchema = z
  .object({
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().positive().default(10),
  })
  .strict()

export const GetRoleParamsSchema = z
  .object({
    roleId: z.coerce.number(),
  })
  .strict()

export const GetRoleDetailResponseSchema = RoleWithPermissionsSchema

export const CreateRoleBodySchema = RoleSchema.pick({
  name: true,
  description: true,
  isActive: true,
}).strict()

export const CreateRoleResponseSchema = RoleSchema

export const UpdateRoleBodySchema = RoleSchema.pick({
  name: true,
  description: true,
  isActive: true,
})
  .extend({
    permissionIds: z.array(z.number()),
  })
  .strict()

export type RoleType = z.infer<typeof RoleSchema>
export type RoleWithPermissionsType = z.infer<typeof RoleWithPermissionsSchema>
export type GetRolesResponseType = z.infer<typeof GetRolesResponseSchema>
export type GetRolesQueryType = z.infer<typeof GetRolesQuerySchema>
export type GetRoleDetailResponseType = z.infer<typeof GetRoleDetailResponseSchema>
export type CreateRoleResponseType = z.infer<typeof CreateRoleResponseSchema>
export type CreateRoleBodyType = z.infer<typeof CreateRoleBodySchema>
export type GetRoleParamsType = z.infer<typeof GetRoleParamsSchema>
export type UpdateRoleBodyType = z.infer<typeof UpdateRoleBodySchema>
