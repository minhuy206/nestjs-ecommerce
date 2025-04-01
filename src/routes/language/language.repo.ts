import { Injectable } from '@nestjs/common'
import { PrismaService } from 'src/shared/services/prisma.service'
import { CreateLanguageBodyType, LanguageType, UpdateLanguageBodyType } from './language.entity'

@Injectable()
export class LanguageRepository {
  constructor(private readonly prismaService: PrismaService) {}

  findAll() {
    return this.prismaService.language.findMany({
      where: {
        deletedAt: null,
      },
    })
  }

  findOne(id: string): Promise<LanguageType | null> {
    return this.prismaService.language.findUnique({
      where: { id, deletedAt: null },
    })
  }

  create({ createdById, data }: { createdById: number; data: CreateLanguageBodyType }): Promise<LanguageType | null> {
    return this.prismaService.language.create({
      data: {
        ...data,
        createdById,
      },
    })
  }

  update({
    id,
    updatedById,
    data,
  }: {
    id: string
    updatedById: number
    data: UpdateLanguageBodyType
  }): Promise<LanguageType | null> {
    return this.prismaService.language.update({
      where: { id, deletedAt: null },
      data: { ...data, updatedById },
    })
  }

  delete(id: string, isHard: boolean): Promise<LanguageType | null> {
    return isHard
      ? this.prismaService.language.delete({
          where: { id },
        })
      : this.prismaService.language.update({
          where: { id },
          data: {
            deletedAt: new Date(),
          },
        })
  }
}
