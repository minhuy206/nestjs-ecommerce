import { GoogleService } from './google.service'
import { ZodSerializerDto } from 'nestjs-zod'
import {
  Disable2FABodyDTO,
  ForgotPasswordBodyDTO,
  GetAuthorizationResponseDTO,
  LoginBodyDTO,
  LoginResponseDTO,
  LogoutBodyDTO,
  RefreshTokenBodyDTO,
  RefreshTokenResponseDTO,
  RegisterBodyDTO,
  RegisterResponseDTO,
  SendOTPBodyDTO,
  TwoFASetupResponseDTO,
} from './auth.dto'
import { AuthService } from './auth.service'
import { Body, Controller, Get, HttpCode, HttpStatus, Ip, Post, Query, Res } from '@nestjs/common'
import { UserAgent } from 'src/shared/decorators/user-agent.decorator'
import { MessageResponseDTO } from 'src/shared/dtos/response.dto'
import { IsPublic } from 'src/shared/decorators/Auth.decorator'
import { Response } from 'express'
import envConfig from 'src/shared/config'
import { EmptyBodyDTO } from 'src/shared/dtos/request.dto'
import { ActiveUser } from 'src/shared/decorators/active-user.decorator'
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiQuery,
  ApiTags,
  ApiUnauthorizedResponse,
  ApiUnprocessableEntityResponse,
} from '@nestjs/swagger'
import { UserStatus } from 'src/shared/constants/auth.constant'

@Controller('auth')
@ApiTags('Auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly googleService: GoogleService,
  ) {}

  @Post('register')
  @ApiOperation({ summary: 'Register a new user', description: '**Create a new user**' })
  @ApiCreatedResponse({
    content: {
      'application/json': {
        example: {
          id: 1,
          name: 'Your Name',
          email: 'email@domain.com',
          phoneNumber: '0123456789',
          avatar: 'https://example.com/avatar.jpg',
          roleId: 1,
          status: UserStatus.ACTIVE,
          createdById: 2,
          updatedById: 2,
          createdAt: new Date(),
          updatedAt: new Date(),
          deletedAt: new Date(),
        } as RegisterResponseDTO,
      },
    },
  })
  @ApiUnprocessableEntityResponse({
    description: 'Unprocessable Entity',
    content: {
      'application/json': {
        example: {
          statusCode: 422,
          messages: [
            {
              path: 'email',
              message: 'Error.EmailAlreadyExists',
            },
          ],
          error: 'Unprocessable Entity',
        },
      },
    },
  })
  @IsPublic()
  @ZodSerializerDto(RegisterResponseDTO)
  async register(@Body() body: RegisterBodyDTO) {
    return await this.authService.register(body)
  }

  @Post('login')
  @ApiOperation({
    summary: 'Login user with 2FA',
    description: '**Login user with email and password. totpCode is required if only 2FA is enable**',
  })
  @ApiCreatedResponse({
    schema: {
      type: 'object',
      properties: {
        accessToken: {
          type: 'string',
          example:
            'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c',
        },
        refreshToken: {
          type: 'string',
          example:
            'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c',
        },
      },
      required: ['accessToken', 'refreshToken'],
    },
  })
  @ApiUnprocessableEntityResponse({
    description: 'Unprocessable Entity',
    content: {
      'application/json': {
        example: {
          statusCode: 422,
          messages: [
            {
              path: 'email',
              message: 'Error.EmailNotFound',
            },
          ],
          error: 'Unprocessable Entity',
        },
      },
    },
  })
  @IsPublic()
  @ZodSerializerDto(LoginResponseDTO)
  login(@Body() body: LoginBodyDTO, @UserAgent() userAgent: string, @Ip() ip: string) {
    return this.authService.login({ ...body, userAgent, ip })
  }

  @Post('otp')
  @ApiOperation({
    summary: 'Send OTP to email',
    description:
      '**Send OTP to the user. This could be used for registration, login (if 2FA is enable), password reset or disable 2FA**',
  })
  @ApiCreatedResponse({
    content: {
      'application/json': {
        example: {
          message: 'OTP has been sent to your email',
        } as MessageResponseDTO,
      },
    },
  })
  @ApiUnprocessableEntityResponse({
    description: 'Unprocessable Entity',
    content: {
      'application/json': {
        example: {
          statusCode: 422,
          messages: [
            {
              path: 'email',
              message: 'Error.EmailNotFound',
            },
          ],
          error: 'Unprocessable Entity',
        },
      },
    },
  })
  @IsPublic()
  @ZodSerializerDto(MessageResponseDTO)
  sendOTP(@Body() body: SendOTPBodyDTO) {
    return this.authService.sendOTP(body)
  }

  // Why don't use GET method instead of POST if body is an empty object. Because POST means create something and POST is more secure than GET because GET could be called through URL but POST is not.
  @Post('2fa/setup')
  @ApiOperation({
    summary: 'Setup 2FA',
    description: '**Setup 2FA for user**',
  })
  @ApiCreatedResponse({
    content: {
      'application/json': {
        example: {
          message: 'Password has been changed successfully',
        } as MessageResponseDTO,
      },
    },
  })
  @ApiUnprocessableEntityResponse({
    description: 'Unprocessable Entity',
    content: {
      'application/json': {
        example: {
          statusCode: 422,
          messages: [
            {
              path: '',
              message: 'Required',
            },
          ],
          error: 'Unprocessable Entity',
        },
      },
    },
  })
  @ApiUnauthorizedResponse({
    description: 'Unauthorized',
    content: {
      'application/json': {
        example: {
          statusCode: 401,
          message: 'Unauthorized',
        },
      },
    },
  })
  @ApiBearerAuth()
  @ZodSerializerDto(TwoFASetupResponseDTO)
  setup2FA(@Body() _: EmptyBodyDTO, @ActiveUser('userId') userId: number) {
    return this.authService.setup2FA(userId)
  }

  @Post('2fa/disable')
  @ApiOperation({
    summary: 'Disable 2FA',
    description: '**Disable 2FA for user**',
  })
  @ApiCreatedResponse({
    content: {
      'application/json': {
        example: {
          message: '2FA has been disabled successfully',
        } as MessageResponseDTO,
      },
    },
  })
  @ApiUnprocessableEntityResponse({
    description: 'Unprocessable Entity',
    content: {
      'application/json': {
        example: {
          statusCode: 422,
          messages: [
            {
              path: 'totpCode',
              message: 'Error.NotEnabled2FA',
            },
          ],
          error: 'Unprocessable Entity',
        },
      },
    },
  })
  @ApiUnauthorizedResponse({
    description: 'Unauthorized',
    content: {
      'application/json': {
        example: {
          statusCode: 401,
          message: 'Unauthorized',
        },
      },
    },
  })
  @ApiBearerAuth()
  @ZodSerializerDto(MessageResponseDTO)
  disable2FA(@Body() body: Disable2FABodyDTO, @ActiveUser('userId') userId: number) {
    return this.authService.disable2FA({ ...body, userId })
  }

  @Post('refresh-token')
  @ApiOperation({
    summary: 'Refresh access token',
    description: '**Refresh access token using refresh token**',
  })
  @ApiCreatedResponse({
    schema: {
      type: 'object',
      properties: {
        accessToken: {
          type: 'string',
          example:
            'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c',
        },
        refreshToken: {
          type: 'string',
          example:
            'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c',
        },
      },
      required: ['accessToken', 'refreshToken'],
    },
  })
  @IsPublic()
  @HttpCode(HttpStatus.OK)
  @ZodSerializerDto(RefreshTokenResponseDTO)
  refreshToken(@Body() body: RefreshTokenBodyDTO, @UserAgent() userAgent: string, @Ip() ip: string) {
    return this.authService.refreshToken({ refreshToken: body.refreshToken, userAgent, ip })
  }

  @Post('forgot-password')
  @ApiOperation({
    summary: 'Forgot password',
    description: '**Send OTP to email to reset password**',
  })
  @ApiCreatedResponse({
    content: {
      'application/json': {
        example: {
          message: 'Password has been changed successfully',
        } as MessageResponseDTO,
      },
    },
  })
  @ApiUnprocessableEntityResponse({
    description: 'Unprocessable Entity',
    content: {
      'application/json': {
        example: {
          statusCode: 422,
          messages: [
            {
              path: 'email',
              message: 'Error.EmailNotFound',
            },
          ],
          error: 'Unprocessable Entity',
        },
      },
    },
  })
  @IsPublic()
  @ZodSerializerDto(MessageResponseDTO)
  forgotPassword(@Body() body: ForgotPasswordBodyDTO) {
    return this.authService.forgotPassword(body)
  }

  @Post('logout')
  @ApiOperation({
    summary: 'Logout user',
    description: '**Logout user and delete refresh token**',
  })
  @ApiCreatedResponse({
    content: {
      'application/json': {
        example: {
          message: 'Logout successfully',
        } as MessageResponseDTO,
      },
    },
  })
  @ApiUnauthorizedResponse({
    description: 'Unauthorized',
    content: {
      'application/json': {
        example: {
          statusCode: 401,
          message: 'Unauthorized',
        },
      },
    },
  })
  @ApiBearerAuth()
  @ZodSerializerDto(MessageResponseDTO)
  logout(@Body() body: LogoutBodyDTO) {
    return this.authService.logout(body.refreshToken)
  }

  @Get('google-link')
  @ApiOperation({
    summary: 'Get Google authorization URL',
    description: '**Get Google authorization URL**',
  })
  @ApiOkResponse({
    content: {
      'application/json': {
        example: {
          url: 'https://accounts.google.com/o/oauth2/v2/auth?access_type=offline&scope=https%3A%2F%2Fwww.googleapis.com%2Fauth%2Fuserinfo.profile%20https%3A%2F%2Fwww.googleapis.com%2Fauth%2Fuserinfo.email&include_granted_scopes=true&state=eyJ1c2VyQWdlbnQiOiJQb3N0bWFuUnVudGltZS83LjQzLjMiLCJpcCI6Ijo6MSJ9&response_type=code&client_id=970657688060-vak16pdosmho0vh161bstulnl1j35j74.apps.googleusercontent.com&redirect_uri=http%3A%2F%2Flocalhost%3A3000%2Fauth%2Fgoogle%2Fcallback',
        } as GetAuthorizationResponseDTO,
      },
    },
  })
  @IsPublic()
  @ZodSerializerDto(GetAuthorizationResponseDTO)
  getAuthorizationUrl(@UserAgent() userAgent: string, @Ip() ip: string) {
    return this.googleService.getAuthorizationUrl({ userAgent, ip })
  }

  @Get('google/callback')
  @ApiOperation({
    summary: 'Google callback',
    description: '**Google callback**',
  })
  @ApiQuery({
    name: 'code',
    required: true,
    description: 'Authorization code returned from Google',
    type: 'string',
    example: '4/0AQSTgQE4gGPIZrKL4FIfDbkmDbfqmW9QkjcERgIkwMiPCzXF6a9FojDT02NRSqfZG3gk2A',
  })
  @ApiQuery({
    name: 'state',
    required: true,
    description: 'State parameter returned from Google',
    type: 'string',
    example: 'eyJ1c2VyQWdlbnQiOiJQb3N0bWFuUnVudGltZS83LjQzLjMiLCJpcCI6Ijo6MSJ9',
  })
  @IsPublic()
  async googleCallback(@Query('code') code: string, @Query('state') state: string, @Res() res: Response) {
    try {
      const data = await this.googleService.googleCallback({ code, state })
      return res.redirect(
        `${envConfig.GOOGLE_CLIENT_REDIRECT_URI}?accessToken=${data.accessToken}&refreshToken=${data.refreshToken}`,
      )
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Error occurred using Google login, please try another way'
      return res.redirect(`${envConfig.GOOGLE_CLIENT_REDIRECT_URI}?errorMessage=${message}`)
    }
  }
}
