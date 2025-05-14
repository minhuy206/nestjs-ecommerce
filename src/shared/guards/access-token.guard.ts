import { CanActivate, ExecutionContext, ForbiddenException, Injectable, UnauthorizedException } from '@nestjs/common'
import { REQUEST_USER_KEY } from '../constants/auth.constant'
import { HTTPMethod } from '../constants/role.constant'
import { PrismaService } from '../services/prisma.service'
import { TokenService } from '../services/token.service'
import { AccessTokenPayload } from '../types/jwt.type'

@Injectable()
export class AccessTokenGuard implements CanActivate {
  constructor(
    private readonly tokenService: TokenService,
    private readonly prisma: PrismaService,
  ) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest()
    const decodedAccessToken = await this.extractAndValidateToken(request)
    await this.validateUserPermission(decodedAccessToken, request)
    return true
  }

  private async extractAndValidateToken(request: any): Promise<AccessTokenPayload> {
    const accessToken = this.extractAccessTokenFromHeader(request)
    try {
      const decodedAccessToken = await this.tokenService.verifyAccessToken(accessToken)
      request[REQUEST_USER_KEY] = decodedAccessToken
      return decodedAccessToken
    } catch {
      throw new UnauthorizedException('Error.InvalidAccessToken')
    }
  }

  private extractAccessTokenFromHeader(request): string {
    const accessToken = request.headers.authorization?.split(' ')[1]
    if (!accessToken) {
      throw new UnauthorizedException('Error.MissingAccessToken')
    }
    return accessToken
  }

  private async validateUserPermission(decodedAccessToken: AccessTokenPayload, request: any): Promise<void> {
    const roleId = decodedAccessToken.roleId
    const path = request.route.path
    const method = request.method as keyof typeof HTTPMethod
    const role = await this.prisma.role
      .findUniqueOrThrow({
        where: {
          id: roleId,
          deletedAt: null,
          isActive: true,
        },
        include: {
          permissions: {
            where: {
              path,
              method,
              deletedAt: null,
            },
          },
        },
      })
      .catch(() => {
        throw new ForbiddenException('Error.Forbidden')
      })

    const canAccess = role.permissions.length > 0

    if (!canAccess) {
      throw new ForbiddenException('Error.Forbidden')
    }
  }
}
