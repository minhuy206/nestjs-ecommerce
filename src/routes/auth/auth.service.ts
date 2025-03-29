import { AuthRepository } from './auth.repo'
import { HttpException, Injectable } from '@nestjs/common'
import { RolesService } from 'src/routes/auth/roles.service'
import { generateOTP, isNotFoundPrismaError, isUniqueConstraintPrismaError } from 'src/shared/helpers'
import { HashingService } from 'src/shared/services/hashing.service'
import { TokenService } from 'src/shared/services/token.service'
import { LoginBodyType, RegisterBodyType, SendOTPBodyType, RefreshTokenBodyType } from './auth.model'
import { SharedUserRepository } from 'src/shared/repositories/shared-user.repo'
import { addMilliseconds } from 'date-fns'
import ms from 'ms'
import envConfig from 'src/shared/config'
import { TypeOfVerificationCode } from 'src/shared/constants/auth.constant'
import { EmailService } from 'src/shared/services/email.service'
import { AccessTokenPayloadCreate } from 'src/shared/types/jwt.type'
import {
  EmailAlreadyExistsException,
  EmailNotFoundException,
  FailedToSendOTPException,
  InvalidOTPException,
  InvalidPasswordException,
  OTPExpiredException,
  RefreshTokenAlreadyUsedException,
  UnauthorizedAccessException,
} from './error.model'

@Injectable()
export class AuthService {
  constructor(
    private readonly hashingService: HashingService,
    private readonly tokenService: TokenService,
    private readonly rolesService: RolesService,
    private readonly authRepository: AuthRepository,
    private readonly emailService: EmailService,
    private readonly sharedUserRepository: SharedUserRepository,
  ) {}

  async register(body: RegisterBodyType) {
    try {
      const verificationCode = await this.authRepository.findUniqueVerificationCode({
        email: body.email,
        type: TypeOfVerificationCode.REGISTER,
        code: body.code,
      })
      if (!verificationCode) {
        throw InvalidOTPException
      }
      if (verificationCode.expiresAt < new Date()) {
        throw OTPExpiredException
      }

      const clientRoleId = await this.rolesService.getClientRoleId()
      const hashedPassword = await this.hashingService.hash(body.password)
      return await this.authRepository.createUser({
        email: body.email,
        name: body.name,
        phoneNumber: body.phoneNumber,
        password: hashedPassword,
        roleId: clientRoleId,
      })
    } catch (error) {
      if (isUniqueConstraintPrismaError(error)) {
        throw EmailAlreadyExistsException
      }
      throw error
    }
  }

  async sendOTP(body: SendOTPBodyType) {
    const user = await this.sharedUserRepository.findUnique({
      email: body.email,
    })
    if (user) {
      throw EmailAlreadyExistsException
    }

    const code = generateOTP()
    await this.authRepository.createVerificationCode({
      email: body.email,
      code,
      type: body.type,
      expiresAt: addMilliseconds(new Date(), ms(envConfig.OTP_EXPIRES_IN)),
    })

    const { error } = await this.emailService.sendOTP({
      email: body.email,
      code,
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
}
