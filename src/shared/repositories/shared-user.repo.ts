import { Injectable } from '@nestjs/common'
import { PrismaService } from '../services/prisma.service'
import { UserType } from '../entities/shared-user.entites'

@Injectable()
export class SharedUserRepository {
  constructor(private readonly prismaService: PrismaService) {}

  async findUnique(uniqueObject: { email: string } | { id: number }): Promise<UserType | null> {
    return this.prismaService.user.findUnique({
      where: uniqueObject,
    })
  }
}
