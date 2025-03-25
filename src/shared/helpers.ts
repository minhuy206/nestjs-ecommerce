import { Prisma } from '@prisma/client'
import { randomInt } from 'crypto'

export function isUniqueConstraintPrismaError(error: any): error is Prisma.PrismaClientKnownRequestError {
  return error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002'
}

export function isNotFoundPrismaError(error: any): error is Prisma.PrismaClientKnownRequestError {
  return error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025'
}

export const generateOTP = () => {
  let code = String(randomInt(0, 1000000))
  const codeLength = 6
  while (code.length < codeLength) {
    code = '0' + code
  }
  return code
}
