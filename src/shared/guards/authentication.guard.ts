import { APIKeyGuard } from './api-key.guard'
import { AccessTokenGuard } from './access-token.guard'
import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common'
import { AUTH_TYPE_KEY, AuthTypeDecoratorPayload } from '../decorators/Auth.decorator'
import { Reflector } from '@nestjs/core'
import { AUTH_TYPES, CONDITION_GUARD } from '../constants/auth.constant'

@Injectable()
export class AuthenticationGuard implements CanActivate {
  private readonly authTypeGuardMap: Record<string, CanActivate>

  constructor(
    private readonly reflector: Reflector,
    private readonly apiKeyGuard: APIKeyGuard,
    private readonly accessTokenGuard: AccessTokenGuard,
  ) {
    this.authTypeGuardMap = {
      [AUTH_TYPES.Bearer]: this.accessTokenGuard,
      [AUTH_TYPES.APIKey]: this.apiKeyGuard,
      [AUTH_TYPES.None]: { canActivate: () => true },
    }
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const authTypeValue = this.reflector.getAllAndOverride<AuthTypeDecoratorPayload>(AUTH_TYPE_KEY, [
      context.getHandler(),
      context.getClass(),
    ]) ?? { authTypes: [AUTH_TYPES.None], options: { condition: CONDITION_GUARD.And } }

    const guards = authTypeValue.authTypes.map((authType) => this.authTypeGuardMap[authType])

    if (authTypeValue.options.condition === CONDITION_GUARD.Or) {
      for (const guard of guards) {
        const canActive = await Promise.resolve(guard.canActivate(context)).catch(() => {
          return false
        })
        if (canActive) {
          return true
        }
      }
      throw new UnauthorizedException()
    } else {
      for (const guard of guards) {
        await guard.canActivate(context)
      }
    }

    return true
  }
}
