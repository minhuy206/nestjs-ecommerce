import { SetMetadata } from '@nestjs/common'
import { AUTH_TYPES, AuthTypeType, CONDITION_GUARD, ConditionGuardType } from '../constants/auth.constant'

export const AUTH_TYPE_KEY = 'authType'
export type AuthTypeDecoratorPayload = { authTypes: AuthTypeType[]; options: { condition: ConditionGuardType } }

export const Auth = (authTypes: AuthTypeType[], options?: { condition: ConditionGuardType | undefined }) => {
  return SetMetadata(AUTH_TYPE_KEY, {
    authTypes,
    options: options ?? { condition: CONDITION_GUARD.And },
  })
}

export const IsPublic = () => Auth([AUTH_TYPES.None])
