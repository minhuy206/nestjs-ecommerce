import { Prisma } from '@prisma/client'
import { randomInt } from 'crypto'

export function isUniqueConstraintPrismaError(error: any): error is Prisma.PrismaClientKnownRequestError {
  return error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002'
}

export function isNotFoundPrismaError(error: any): error is Prisma.PrismaClientKnownRequestError {
  return error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025'
}

export const generateOTP = () => {
  let otp = String(randomInt(0, 1000000))
  const otpLength = 6
  while (otp.length < otpLength) {
    otp = '0' + otp
  }
  return otp
}
