export const REQUEST_USER_KEY = 'user'

export const AUTH_TYPES = {
  Bearer: 'Bearer',
  None: 'None',
  APIKey: 'APIKey',
} as const

export type AuthTypeType = (typeof AUTH_TYPES)[keyof typeof AUTH_TYPES]

export const CONDITION_GUARD = {
  And: 'and',
  Or: 'or',
} as const

export type ConditionGuardType = (typeof CONDITION_GUARD)[keyof typeof CONDITION_GUARD]

export const UserStatus = {
  ACTIVE: 'ACTIVE',
  INACTIVE: 'INACTIVE',
  BLOCKED: 'BLOCKED',
} as const

export const TypeOfVerificationCode = {
  REGISTER: 'REGISTER',
  FORGOT_PASSWORD: 'FORGOT_PASSWORD',
} as const

export type TypeOfVerificationCode = (typeof TypeOfVerificationCode)[keyof typeof TypeOfVerificationCode]
