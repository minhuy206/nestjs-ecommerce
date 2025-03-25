import fs from 'fs'
import z from 'zod'
import path from 'path'
import { config } from 'dotenv'

config({
  path: '.env',
})
// Kiểm tra coi thử có file .env chưa
if (!fs.existsSync(path.resolve('.env'))) {
  console.error('Không tìm thấy file .env')
  process.exit(1)
}

const configSchema = z.object({
  DATABASE_URL: z.string(),
  SECRET_API_KEY: z.string(),
  ACCESS_TOKEN_SECRET: z.string(),
  REFRESH_TOKEN_SECRET: z.string(),
  ACCESS_TOKEN_EXPIRES_IN: z.string(),
  REFRESH_TOKEN_EXPIRES_IN: z.string(),
  ADMIN_NAME: z.string(),
  ADMIN_EMAIL: z.string(),
  ADMIN_PASSWORD: z.string(),
  ADMIN_PHONE_NUMBER: z.string(),
  OTP_EXPIRES_IN: z.string(),
})

const configServer = configSchema.safeParse(process.env)

if (!configServer.success) {
  console.log('Values in .env are invalid')
  console.error(configServer.error)
  process.exit(1)
}

const envConfig = configServer.data

export default envConfig
