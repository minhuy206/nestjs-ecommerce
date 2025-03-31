import { z } from 'zod'

export const LanguageSchema = z.object({
  id: z.string().max(10),
  name: z.string().max(100),
  createdAt: z.date(),
  updatedAt: z.date(),
  deletedAt: z.date().nullable(),
  createdById: z.number().nullable(),
  updatedById: z.number().nullable(),
})

export const GetLanguagesResponseSchema = z.object({
  data: z.array(LanguageSchema),
  totalItems: z.number(),
})

export const GetLanguageParamsSchema = z
  .object({
    languageId: z.string(),
  })
  .strict()

export const CreateLanguageBodySchema = LanguageSchema.pick({
  name: true,
  id: true,
}).strict()

export const UpdateLanguageBodySchema = LanguageSchema.pick({
  name: true,
}).strict()

export const GetLanguageDetailResponseSchema = LanguageSchema

export type LanguageType = z.infer<typeof LanguageSchema>
export type CreateLanguageBodyType = z.infer<typeof CreateLanguageBodySchema>
export type UpdateLanguageBodyType = z.infer<typeof UpdateLanguageBodySchema>
export type GetLanguagesResponseType = z.infer<typeof GetLanguagesResponseSchema>
export type GetLanguageParamsType = z.infer<typeof GetLanguageParamsSchema>
export type GetLanguageDetailResponseType = LanguageType
