import { Module } from '@nestjs/common'
import { LanguageService } from './language.service'
import { LanguageController } from './language.controller'
import { LanguageRepository } from './language.repo'

@Module({
  controllers: [LanguageController],
  providers: [LanguageService, LanguageRepository],
})
export class LanguageModule {}
