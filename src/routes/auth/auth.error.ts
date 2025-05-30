import { UnauthorizedException, UnprocessableEntityException } from '@nestjs/common'

// OTP related errors
export const InvalidOTPException = new UnprocessableEntityException([
  {
    message: 'Error.InvalidOTP',
    path: 'otp',
  },
])

export const OTPExpiredException = new UnprocessableEntityException([
  {
    message: 'Error.OTPExpired',
    path: 'otp',
  },
])

export const FailedToSendOTPException = new UnprocessableEntityException([
  {
    message: 'Error.FailedToSendOTP',
    path: 'otp',
  },
])

// Email related errors
export const EmailAlreadyExistsException = new UnprocessableEntityException([
  {
    message: 'Error.EmailAlreadyExists',
    path: 'email',
  },
])

export const EmailNotFoundException = new UnprocessableEntityException([
  {
    message: 'Error.EmailNotFound',
    path: 'email',
  },
])

// Password related errors
export const InvalidPasswordException = new UnprocessableEntityException([
  {
    message: 'Error.InvalidPassword',
    path: 'password',
  },
])

// Auth token related errors
export const RefreshTokenAlreadyUsedException = new UnauthorizedException('Error.RefreshTokenAlreadyUsed')
export const UnauthorizedAccessException = new UnauthorizedException('Error.UnauthorizedAccess')

// Google auth related errors
export const GoogleUserInfoError = new Error('Error.FailedToGetGoogleUserInfo')

// 2FA related errors
export const AlreadyEnabled2FAException = new UnprocessableEntityException([
  {
    message: 'Error.AlreadyEnabled2FA',
    path: 'totpCode',
  },
])

export const NotEnabled2FAException = new UnprocessableEntityException([
  {
    message: 'Error.NotEnabled2FA',
    path: 'totpCode',
  },
])

export const InvalidTOTPAndCodeException = new UnprocessableEntityException([
  {
    message: 'Error.InvalidTOTPAndCode',
    path: 'totpCode',
  },
  {
    message: 'Error.InvalidTOTPAndCode',
    path: 'otp',
  },
])

export const InvalidTOTPException = new UnprocessableEntityException([
  {
    message: 'Error.InvalidTOTP',
    path: 'totpCode',
  },
])
