import { GoogleService } from './google.service'
import { ZodSerializerDto } from 'nestjs-zod'
import {
  ForgotPasswordBodyDTO,
  GetAuthorizationResponseDTO,
  LoginBodyDTO,
  LoginResponseDTO,
  LogoutBodyDTO,
  RefreshTokenBodyDTO,
  RefreshTokenResponseDTO,
  RegisterBodyDto,
  RegisterResponseDto,
  SendOTPBodyDTO,
} from './auth.dto'
import { AuthService } from './auth.service'
import { Body, Controller, Get, HttpCode, HttpStatus, Ip, Post, Query, Res } from '@nestjs/common'
import { UserAgent } from 'src/shared/decorators/user-agent.decorator'
import { MessageResponseDTO } from 'src/shared/dtos/response.dto'
import { IsPublic } from 'src/shared/decorators/Auth.decorator'
import { Response } from 'express'
import envConfig from 'src/shared/config'

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly googleService: GoogleService,
  ) {}

  @Post('register')
  @IsPublic()
  @ZodSerializerDto(RegisterResponseDto)
  async register(@Body() body: RegisterBodyDto) {
    return await this.authService.register(body)
  }

  @Post('otp')
  @IsPublic()
  @ZodSerializerDto(MessageResponseDTO)
  sendOTP(@Body() body: SendOTPBodyDTO) {
    return this.authService.sendOTP(body)
  }

  @Post('login')
  @IsPublic()
  @ZodSerializerDto(LoginResponseDTO)
  login(@Body() body: LoginBodyDTO, @UserAgent() userAgent: string, @Ip() ip: string) {
    return this.authService.login({ ...body, userAgent, ip })
  }

  @Post('refresh-token')
  @IsPublic()
  @HttpCode(HttpStatus.OK)
  @ZodSerializerDto(RefreshTokenResponseDTO)
  refreshToken(@Body() body: RefreshTokenBodyDTO, @UserAgent() userAgent: string, @Ip() ip: string) {
    return this.authService.refreshToken({ refreshToken: body.refreshToken, userAgent, ip })
  }

  @Post('logout')
  @ZodSerializerDto(MessageResponseDTO)
  logout(@Body() body: LogoutBodyDTO) {
    return this.authService.logout(body.refreshToken)
  }

  @Get('google-link')
  @IsPublic()
  @ZodSerializerDto(GetAuthorizationResponseDTO)
  getAuthorizationUrl(@UserAgent() userAgent: string, @Ip() ip: string) {
    return this.googleService.getAuthorizationUrl({ userAgent, ip })
  }

  @Get('google/callback')
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

  @Post('forgot-password')
  @IsPublic()
  @ZodSerializerDto(MessageResponseDTO)
  forgotPassword(@Body() body: ForgotPasswordBodyDTO) {
    return this.authService.forgotPassword(body)
  }
}
