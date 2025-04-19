import { Controller, Get, Post, Body, Param, Delete, Put } from '@nestjs/common'
import { LanguageService } from './language.service'
import {
  CreateLanguageBodyDTO,
  GetLanguageDetailResponseDTO,
  GetLanguageParamsDTO,
  GetLanguagesResponseDTO,
  UpdateLanguageBodyDTO,
} from './language.dto'
import { ZodSerializerDto } from 'nestjs-zod'
import { MessageResponseDTO } from 'src/shared/dtos/response.dto'
import { ActiveUser } from 'src/shared/decorators/active-user.decorator'
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
  ApiUnauthorizedResponse,
  ApiUnprocessableEntityResponse,
} from '@nestjs/swagger'

@Controller('languages')
@ApiTags('Languages')
export class LanguageController {
  constructor(private readonly languageService: LanguageService) {}

  @Get()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all languages', description: '**Only admin can use this API endpoint**' })
  @ApiOkResponse({
    description: 'Get all languages successfully!!',
    content: {
      'application/json': {
        example: {
          data: [
            {
              id: 'en',
              name: 'English',
              createdAt: new Date(),
              updatedAt: new Date(),
              deletedAt: null,
              createdById: 1,
              updatedById: 1,
            },
          ],
          totalItems: 1,
        } as GetLanguagesResponseDTO,
      },
    },
  })
  @ApiUnauthorizedResponse({
    description: 'Unauthorized',
    content: {
      'application/json': {
        example: {
          statusCode: 401,
          message: 'Unauthorized',
        },
      },
    },
  })
  @ZodSerializerDto(GetLanguagesResponseDTO)
  findAll() {
    return this.languageService.findAll()
  }

  @Post()
  @ApiOperation({ summary: 'Create a new language', description: '**Only admin can use this API endpoint**' })
  @ApiBearerAuth()
  @ApiCreatedResponse({
    description: 'Language created successfully!!',
    content: {
      'application/json': {
        example: {
          id: 'en',
          name: 'English',
          createdAt: new Date(),
          updatedAt: new Date(),
          deletedAt: null,
          createdById: 1,
          updatedById: 1,
        } as GetLanguageDetailResponseDTO,
      },
    },
  })
  @ApiUnauthorizedResponse({
    description: 'Unauthorized',
    content: {
      'application/json': {
        example: {
          statusCode: 401,
          message: 'Unauthorized',
        },
      },
    },
  })
  @ApiUnprocessableEntityResponse({
    description: 'Unprocessable Entity',
    content: {
      'application/json': {
        example: {
          statusCode: 422,
          messages: [
            {
              path: 'id',
              message: 'Error.LanguageAlreadyExists',
            },
          ],
          error: 'Unprocessable Entity',
        },
      },
    },
  })
  @ZodSerializerDto(GetLanguageDetailResponseDTO)
  create(@Body() body: CreateLanguageBodyDTO, @ActiveUser('userId') userId: number) {
    return this.languageService.create({ data: body, createdById: userId })
  }

  @Get(':languageId')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get language by languageId', description: '**Only admin can use this API endpoint**' })
  @ApiParam({
    name: 'languageId',
    example: 'en',
  })
  @ApiOkResponse({
    description: 'Get language successfully!!',
    content: {
      'application/json': {
        example: {
          id: 'en',
          name: 'English',
          createdAt: new Date(),
          updatedAt: new Date(),
          deletedAt: null,
          createdById: 1,
          updatedById: 1,
        },
      },
    },
  })
  @ApiUnauthorizedResponse({
    description: 'Unauthorized',
    content: {
      'application/json': {
        example: {
          statusCode: 401,
          message: 'Unauthorized',
        },
      },
    },
  })
  @ApiNotFoundResponse({
    description: 'Language not found',
    content: {
      'application/json': {
        example: {
          statusCode: 404,
          message: 'Error.NotFound',
          error: 'Not Found',
        },
      },
    },
  })
  @ZodSerializerDto(GetLanguageDetailResponseDTO)
  findOne(@Param() params: GetLanguageParamsDTO) {
    return this.languageService.findById(params.languageId)
  }

  @Put(':languageId')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update language by languageId', description: '**Only admin can use this API endpoint**' })
  @ApiParam({
    name: 'languageId',
    example: 'en',
  })
  @ApiOkResponse({
    description: 'Language updated successfully!!',
    content: {
      'application/json': {
        example: {
          id: 'en',
          name: 'English',
          createdAt: new Date(),
          updatedAt: new Date(),
          deletedAt: null,
          createdById: 1,
          updatedById: 1,
        } as GetLanguageDetailResponseDTO,
      },
    },
  })
  @ApiUnauthorizedResponse({
    description: 'Unauthorized',
    content: {
      'application/json': {
        example: {
          statusCode: 401,
          message: 'Unauthorized',
        },
      },
    },
  })
  @ApiNotFoundResponse({
    description: 'Language not found',
    content: {
      'application/json': {
        example: {
          statusCode: 404,
          message: 'Error.NotFound',
          error: 'Not Found',
        },
      },
    },
  })
  @ZodSerializerDto(GetLanguageDetailResponseDTO)
  update(
    @Param() params: GetLanguageParamsDTO,
    @Body() body: UpdateLanguageBodyDTO,
    @ActiveUser('userId') userId: number,
  ) {
    return this.languageService.update({ data: body, updatedById: userId, id: params.languageId })
  }

  @Delete(':languageId')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete language by languageId', description: '**Only admin can use this API endpoint**' })
  @ApiParam({
    name: 'languageId',
    example: 'en',
  })
  @ApiOkResponse({
    description: 'Language deleted successfully!!',
    content: {
      'application/json': {
        example: {
          message: 'Language deleted successfully!!',
        } as MessageResponseDTO,
      },
    },
  })
  @ApiUnauthorizedResponse({
    description: 'Unauthorized',
    content: {
      'application/json': {
        example: {
          statusCode: 401,
          message: 'Unauthorized',
        },
      },
    },
  })
  @ApiNotFoundResponse({
    description: 'Language not found',
    content: {
      'application/json': {
        example: {
          statusCode: 404,
          message: 'Error.NotFound',
          error: 'Not Found',
        },
      },
    },
  })
  @ZodSerializerDto(MessageResponseDTO)
  delete(@Param() params: GetLanguageParamsDTO) {
    return this.languageService.delete(params.languageId)
  }
}
