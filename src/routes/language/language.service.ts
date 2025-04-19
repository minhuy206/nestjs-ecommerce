import { Injectable } from '@nestjs/common'
import { CreateLanguageBodyType, UpdateLanguageBodyType } from './language.model'
import { LanguageRepository } from './language.repo'
import { LanguageAlreadyExistsException } from './language.error'
import { NotFoundRecordException } from 'src/shared/error'
import { isNotFoundPrismaError, isUniqueConstraintPrismaError } from 'src/shared/helpers'

@Injectable()
export class LanguageService {
  constructor(private readonly languageRepository: LanguageRepository) {}

  async create({ data, createdById }: { data: CreateLanguageBodyType; createdById: number }) {
    try {
      return await this.languageRepository.create({ createdById, data })
    } catch (error) {
      if (isUniqueConstraintPrismaError(error)) {
        throw LanguageAlreadyExistsException
      }
      throw error
    }
  }

  async findAll() {
    const data = await this.languageRepository.findAll()
    return { data, totalItems: data.length }
  }

  async findById(id: string) {
    const language = await this.languageRepository.findOne(id)

    if (!language) {
      throw NotFoundRecordException
    }

    return language
  }

  async update({ id, data, updatedById }: { id: string; data: UpdateLanguageBodyType; updatedById: number }) {
    try {
      const language = await this.languageRepository.update({ id, updatedById, data })

      return language
    } catch (error) {
      if (isNotFoundPrismaError(error)) {
        throw NotFoundRecordException
      }
      throw error
    }
  }

  async delete(id: string) {
    try {
      await this.languageRepository.delete(id, true)
      return {
        message: 'Language deleted successfully',
      }
    } catch (error) {
      if (isNotFoundPrismaError(error)) {
        throw NotFoundRecordException
      }
      throw error
    }
  }
}
