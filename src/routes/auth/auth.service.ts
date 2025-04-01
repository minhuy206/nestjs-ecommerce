import { TwoFAService } from './../../shared/services/2fa.service'
import { AuthRepository } from './auth.repo'
import { HttpException, Injectable } from '@nestjs/common'
import { RolesService } from 'src/routes/auth/roles.service'
import { generateOTP, isNotFoundPrismaError, isUniqueConstraintPrismaError } from 'src/shared/helpers'
import { HashingService } from 'src/shared/services/hashing.service'
import { TokenService } from 'src/shared/services/token.service'
import {
  LoginBodyType,
  RegisterBodyType,
  SendOTPBodyType,
  RefreshTokenBodyType,
  ForgotPasswordBodyType,
  Disable2FABodyType,
} from './auth.entity'
import { SharedUserRepository } from 'src/shared/repositories/shared-user.repo'
import { addMilliseconds } from 'date-fns'
import ms from 'ms'
import envConfig from 'src/shared/config'
import { TypeOfVerificationCode, TypeOfVerificationCodeType } from 'src/shared/constants/auth.constant'
import { EmailService } from 'src/shared/services/email.service'
import { AccessTokenPayloadCreate } from 'src/shared/types/jwt.type'
import {
  InvalidOTPException,
  AlreadyEnabled2FAException,
  EmailAlreadyExistsException,
  EmailNotFoundException,
  FailedToSendOTPException,
  InvalidTOTPAndCodeException,
  InvalidPasswordException,
  OTPExpiredException,
  RefreshTokenAlreadyUsedException,
  UnauthorizedAccessException,
  InvalidTOTPException,
  NotEnabled2FAException,
} from './auth.error'
@Injectable()
export class AuthService {
  constructor(
    private readonly hashingService: HashingService,
    private readonly tokenService: TokenService,
    private readonly rolesService: RolesService,
    private readonly authRepository: AuthRepository,
    private readonly emailService: EmailService,
    private readonly sharedUserRepository: SharedUserRepository,
    private readonly twoFAService: TwoFAService,
  ) {}

  async validateVerificationCode({
    email,
    otp,
    type,
  }: {
    email: string
    otp: string
    type: TypeOfVerificationCodeType
  }) {
    const verificationCode = await this.authRepository.findUniqueVerificationCode({
      email_otp_type: { email, type, otp },
    })

    if (!verificationCode) {
      throw InvalidOTPException
    }
    if (verificationCode.expiresAt < new Date()) {
      throw OTPExpiredException
    }

    return verificationCode
  }

  async register(body: RegisterBodyType) {
    try {
      await this.validateVerificationCode({ email: body.email, otp: body.otp, type: TypeOfVerificationCode.REGISTER })

      const clientRoleId = await this.rolesService.getClientRoleId()
      const hashedPassword = await this.hashingService.hash(body.password)

      const [user] = await Promise.all([
        this.authRepository.createUser({
          email: body.email,
          name: body.name,
          phoneNumber: body.phoneNumber,
          password: hashedPassword,
          roleId: clientRoleId,
        }),
        this.authRepository.deleteVerificationCode({
          email_otp_type: {
            email: body.email,
            type: TypeOfVerificationCode.REGISTER,
            otp: body.otp,
          },
        }),
      ])

      return user
    } catch (error) {
      if (isUniqueConstraintPrismaError(error)) {
        throw EmailAlreadyExistsException
      }
      throw error
    }
  }

  async sendOTP({ email, type }: SendOTPBodyType) {
    const user = await this.sharedUserRepository.findUnique({
      email,
    })

    if (type === TypeOfVerificationCode.FORGOT_PASSWORD && !user) {
      throw EmailNotFoundException
    }
    if (type === TypeOfVerificationCode.REGISTER && user) {
      throw EmailAlreadyExistsException
    }

    const otp = generateOTP()
    await this.authRepository.createVerificationCode({
      email,
      otp,
      type,
      expiresAt: addMilliseconds(new Date(), ms(envConfig.OTP_EXPIRES_IN)),
    })

    const { error } = await this.emailService.sendOTP({
      email,
      otp,
    })

    if (error) {
      throw FailedToSendOTPException
    }

    return { message: 'OTP has been sent to your email' }
  }

  async login(body: LoginBodyType & { userAgent: string; ip: string }) {
    const user = await this.authRepository.findUniqueUserIncludeRole({
      email: body.email,
    })

    if (!user) {
      throw EmailNotFoundException
    }

    const isPasswordMatch = await this.hashingService.compare(body.password, user.password)
    if (!isPasswordMatch) {
      throw InvalidPasswordException
    }

    // 2FA check
    if (user.totpSecret) {
      if (!body.totpCode && !body.otp) {
        throw InvalidTOTPAndCodeException
      }

      if (body.totpCode) {
        const isValid = this.twoFAService.verifyTOTP({
          email: user.email,
          secret: user.totpSecret,
          token: body.totpCode,
        })
        if (!isValid) {
          throw InvalidTOTPException
        }
      }
    } else if (body.otp) {
      await this.validateVerificationCode({
        email: user.email,
        otp: body.otp,
        type: TypeOfVerificationCode.LOGIN,
      })

      await this.authRepository.deleteVerificationCode({
        email_otp_type: { email: user.email, type: TypeOfVerificationCode.DISABLE_2FA, otp: body.otp },
      })
    }

    const device = await this.authRepository.createDevice({
      userId: user.id,
      userAgent: body.userAgent,
      ip: body.ip,
    })

    const tokens = await this.generateTokens({
      userId: user.id,
      roleId: user.roleId,
      roleName: user.role.name,
      deviceId: device.id,
    })

    return tokens
  }

  async generateTokens({ userId, deviceId, roleId, roleName }: AccessTokenPayloadCreate) {
    const [accessToken, refreshToken] = await Promise.all([
      this.tokenService.signAccessToken({ userId, roleId, roleName, deviceId }),
      this.tokenService.signRefreshToken({ userId }),
    ])

    const decodedRefreshToken = await this.tokenService.verifyRefreshToken(refreshToken)

    await this.authRepository.createRefreshToken({
      token: refreshToken,
      userId,
      expiresAt: new Date(decodedRefreshToken.exp * 1000),
      deviceId,
    })
    return { accessToken, refreshToken }
  }

  async refreshToken({ refreshToken, userAgent, ip }: RefreshTokenBodyType & { userAgent: string; ip: string }) {
    try {
      // 1. Check refreshToken is valid
      const { userId } = await this.tokenService.verifyRefreshToken(refreshToken)

      // 2. Check refreshToken is exist in db
      const refreshTokenInDb = await this.authRepository.findUniqueRefreshTokenIncludeUserRole({
        token: refreshToken,
      })
      if (!refreshTokenInDb) {
        throw RefreshTokenAlreadyUsedException
      }
      const {
        deviceId,
        user: {
          roleId,
          role: { name: roleName },
        },
      } = refreshTokenInDb

      // 3. Update device
      const $updateDevice = this.authRepository.updateDevice(deviceId, { ip, userAgent })

      // 4. Delete old refreshToken
      const $deleteRefreshToken = this.authRepository.deleteRefreshToken({
        token: refreshToken,
      })

      // 5. Create new accessToken and refreshToken
      const $token = this.generateTokens({ userId, deviceId, roleId, roleName })
      const [, , tokens] = await Promise.all([$updateDevice, $deleteRefreshToken, $token])
      return tokens
    } catch (error) {
      // In case refresh token is expired or invalid, announce to user that their refresh token has been stolen or invalid
      if (error instanceof HttpException) {
        throw error
      }
      throw UnauthorizedAccessException
    }
  }

  async logout(refreshToken: string) {
    try {
      // 1. Check refreshToken is valid
      await this.tokenService.verifyRefreshToken(refreshToken)
      // 2. Delete refreshToken in database
      const deletedRefreshToken = await this.authRepository.deleteRefreshToken({
        token: refreshToken,
      })

      // 3. Update device is logged out
      await this.authRepository.updateDevice(deletedRefreshToken.deviceId, {
        isActive: false,
      })

      return { message: 'Logout successfully' }
    } catch (error) {
      // In case refresh token is expired or invalid, announce to user that their refresh token has been stolen or invalid
      if (isNotFoundPrismaError(error)) {
        throw RefreshTokenAlreadyUsedException
      }
      throw UnauthorizedAccessException
    }
  }

  async forgotPassword({ email, newPassword, otp }: ForgotPasswordBodyType) {
    const user = await this.sharedUserRepository.findUnique({
      email,
    })
    if (!user) {
      throw EmailNotFoundException
    }

    await this.validateVerificationCode({ email, otp, type: TypeOfVerificationCode.FORGOT_PASSWORD })

    const hashedPassword = await this.hashingService.hash(newPassword)

    await Promise.all([
      this.authRepository.updateUser({ id: user.id }, { password: hashedPassword }),
      this.authRepository.deleteVerificationCode({
        email_otp_type: { email, type: TypeOfVerificationCode.FORGOT_PASSWORD, otp },
      }),
    ])

    return { message: 'Password has been changed successfully' }
  }

  async setup2FA(userId: number) {
    const user = await this.sharedUserRepository.findUnique({
      id: userId,
    })

    if (!user) {
      throw EmailNotFoundException
    }

    if (user.totpSecret) {
      throw AlreadyEnabled2FAException
    }

    const { secret, uri } = this.twoFAService.generateTOTPSecret(user.email)

    await this.authRepository.updateUser(
      {
        id: userId,
      },
      { totpSecret: secret },
    )

    return { secret, uri }
  }

  async disable2FA({ userId, otp, totpCode }: Disable2FABodyType & { userId: number }) {
    const user = await this.sharedUserRepository.findUnique({
      id: userId,
    })

    if (!user) {
      throw EmailNotFoundException
    }

    if (!user.totpSecret) {
      throw NotEnabled2FAException
    }

    if (totpCode) {
      const isValid = this.twoFAService.verifyTOTP({
        email: user.email,
        token: totpCode,
        secret: user.totpSecret,
      })
      if (!isValid) {
        throw InvalidTOTPException
      }
      await this.authRepository.updateUser({ id: userId }, { totpSecret: null })
    } else if (otp) {
      await this.validateVerificationCode({
        email: user.email,
        otp,
        type: TypeOfVerificationCode.DISABLE_2FA,
      })

      await Promise.all([
        this.authRepository.updateUser({ id: userId }, { totpSecret: null }),
        this.authRepository.deleteVerificationCode({
          email_otp_type: { email: user.email, type: TypeOfVerificationCode.DISABLE_2FA, otp },
        }),
      ])
    }

    return { message: '2FA has been disabled successfully' }
  }
}
