import { IsPublic } from './../../shared/decorators/Auth.decorator'
import { Controller, Get, Post, Body, Param, Delete, Put } from '@nestjs/common'
import { LanguageService } from './language.service'
import {
  CreateLanguageBodyDTO,
  GetLanguageDetailResponseDTO,
  GetLanguageParamsDTO,
  UpdateLanguageBodyDTO,
} from './language.dto'
import { ZodSerializerDto } from 'nestjs-zod'
import { MessageResponseDTO } from 'src/shared/dtos/response.dto'
import { GetLanguagesResponseSchema } from './language.model'
import { ActiveUser } from 'src/shared/decorators/active-user.decorator'

@Controller('languages')
export class LanguageController {
  constructor(private readonly languageService: LanguageService) {}

  @Post()
  @IsPublic()
  @ZodSerializerDto(GetLanguageDetailResponseDTO)
  create(@Body() body: CreateLanguageBodyDTO, @ActiveUser('userId') userId: number) {
    return this.languageService.create({ data: body, createdById: userId })
  }

  @Get()
  @IsPublic()
  @ZodSerializerDto(GetLanguagesResponseSchema)
  findAll() {
    return this.languageService.findAll()
  }

  @Get(':languageId')
  @IsPublic()
  @ZodSerializerDto(GetLanguageDetailResponseDTO)
  findOne(@Param() params: GetLanguageParamsDTO) {
    return this.languageService.findById(params.languageId)
  }

  @Put(':languageId')
  @IsPublic()
  @ZodSerializerDto(GetLanguageDetailResponseDTO)
  update(
    @Param() params: GetLanguageParamsDTO,
    @Body() body: UpdateLanguageBodyDTO,
    @ActiveUser('userId') userId: number,
  ) {
    return this.languageService.update({ data: body, updatedById: userId, id: params.languageId })
  }

  @Delete(':languageId')
  @IsPublic()
  @ZodSerializerDto(MessageResponseDTO)
  remove(@Param() params: GetLanguageParamsDTO) {
    return this.languageService.remove(params.languageId)
  }
}
