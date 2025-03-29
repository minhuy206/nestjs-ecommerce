import { AuthRepository } from './auth.repo'
import { Injectable } from '@nestjs/common'
import { OAuth2Client } from 'google-auth-library'
import { google } from 'googleapis'
import envConfig from 'src/shared/config'
import { GoogleAuthStateType } from './auth.model'
import { RolesService } from './roles.service'
import { v4 as uuidv4 } from 'uuid'
import { HashingService } from 'src/shared/services/hashing.service'
import { AuthService } from './auth.service'

@Injectable()
export class GoogleService {
  private oauth2Client: OAuth2Client
  constructor(
    private readonly authRepository: AuthRepository,
    private readonly hashingService: HashingService,
    private readonly rolesService: RolesService,
    private readonly authService: AuthService,
  ) {
    this.oauth2Client = new google.auth.OAuth2(
      envConfig.GOOGLE_CLIENT_ID,
      envConfig.GOOGLE_CLIENT_SECRET,
      envConfig.GOOGLE_REDIRECT_URI,
    )
  }

  getAuthorizationUrl({ userAgent, ip }: GoogleAuthStateType) {
    const scope = ['https://www.googleapis.com/auth/userinfo.profile', 'https://www.googleapis.com/auth/userinfo.email']

    // Encode the user agent and IP address to base64
    const stateString = Buffer.from(JSON.stringify({ userAgent, ip })).toString('base64')
    const url = this.oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope,
      include_granted_scopes: true,
      state: stateString,
    })

    return { url }
  }

  async googleCallback({ code, state }: { code: string; state: string }) {
    try {
      let userAgent = 'unknown'
      let ip = 'unknown'

      // 1. Get state from URL
      try {
        if (state) {
          const clientInfo = JSON.parse(Buffer.from(state, 'base64').toString()) as GoogleAuthStateType
          userAgent = clientInfo.userAgent
          ip = clientInfo.ip
        }
      } catch (error) {
        console.error('Error decoding state:', error)
      }

      // 2. Get tokens from Google
      const { tokens } = await this.oauth2Client.getToken(code)
      this.oauth2Client.setCredentials(tokens)

      // 3. Get user info from Google
      const oauth2 = google.oauth2({
        auth: this.oauth2Client,
        version: 'v2',
      })

      const { data } = await oauth2.userinfo.get()

      if (!data.email) {
        throw new Error('Email not found in Google profile')
      }

      // 4. Check if user exists in the database
      let user = await this.authRepository.findUniqueUserIncludeRole({
        email: data.email,
      })

      // If not, create a new user
      if (!user) {
        const clientRoleId = await this.rolesService.getClientRoleId()
        const randHashedPassword = await this.hashingService.hash(uuidv4())
        user = await this.authRepository.createUserIncludeRole({
          email: data.email,
          name: data.name ?? '',
          password: randHashedPassword,
          roleId: clientRoleId,
          phoneNumber: '',
          avatar: data.picture ?? null,
        })
      }

      // 5. Create a new device for the user
      const device = await this.authRepository.createDevice({
        userId: user.id,
        userAgent,
        ip,
      })

      // 6. Create a refresh token for the user
      const authTokens = await this.authService.generateTokens({
        userId: user.id,
        roleId: user.roleId,
        roleName: user.role.name,
        deviceId: device.id,
      })

      return authTokens
    } catch (error) {
      console.error('Error in Google callback:', error)
      throw error
    }
  }
}
