import { ZodSerializerDto } from 'nestjs-zod'
import { LoginBodyDTO, RegisterBodyDto, RegisterResponseDto, SendOTPBodyDTO } from './auth.dto'
import { AuthService } from './auth.service'
import { Body, Controller, HttpCode, HttpStatus, Ip, Post } from '@nestjs/common'
import { UserAgent } from 'src/shared/decorators/user-agent.decorator'

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @ZodSerializerDto(RegisterResponseDto)
  async register(@Body() body: RegisterBodyDto) {
    return await this.authService.register(body)
  }

  @Post('otp')
  sendOTP(@Body() body: SendOTPBodyDTO) {
    return this.authService.sendOTP(body)
  }

  @Post('login')
  async login(@Body() body: LoginBodyDTO, @UserAgent() userAgent: string, @Ip() ip: string) {
    return await this.authService.login({ ...body, userAgent, ip })
  }

  @Post('refresh-token')
  @HttpCode(HttpStatus.OK)
  async refreshToken(@Body() body: any) {
    return this.authService.refreshToken(body.refreshToken)
  }

  @Post('logout')
  async logout(@Body() body: any) {
    return this.authService.logout(body.refreshToken)
  }
}
