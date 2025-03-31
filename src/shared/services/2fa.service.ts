import { Injectable } from '@nestjs/common'
import * as OTPAuth from 'otpauth'
import envConfig from '../config'

@Injectable()
export class TwoFAService {
  private createTOTP(email: string, secret?: string) {
    return new OTPAuth.TOTP({
      // Provider or service the account is associated with.
      issuer: envConfig.APP_NAME,
      // Account identifier.
      label: email,
      // Algorithm used for the HMAC function, possible values are:
      //   "SHA1", "SHA224", "SHA256", "SHA384", "SHA512",
      //   "SHA3-224", "SHA3-256", "SHA3-384" and "SHA3-512".
      algorithm: 'SHA1',
      // Length of the generated tokens.
      digits: 6,
      // Interval of time for which a token is valid, in seconds.
      period: 30,
      // Arbitrary key encoded in base32 or `OTPAuth.Secret` instance
      // (if omitted, a cryptographically secure random secret is generated).
      secret: secret || new OTPAuth.Secret(),
      //   or: `OTPAuth.Secret.fromBase32("US3WHSG7X5KAPV27VANWKQHF3SH3HULL")`
      //   or: `new OTPAuth.Secret()`
    })
  }

  generateTOTPSecret(email: string) {
    const totp = this.createTOTP(email)
    return {
      secret: totp.secret.base32,
      uri: totp.toString(),
    }
  }

  verifyTOTP({ email, secret, token }: { email: string; secret: string; token: string }): boolean {
    const totp = this.createTOTP(email, secret)
    const delta = totp.validate({ token, window: 1 })
    return delta !== null
  }
}

// Test the TwoFAService
// const twoFAService = new TwoFAService()
// console.log(
//   twoFAService.verifyTOTP({
//     email: 'vominhhuy0911@gmail.com',
//     token: '344299',
//     secret: 'W62TPYZMBONIE2H6AON2OTW2YNMBLGHH',
//   }),
// )
