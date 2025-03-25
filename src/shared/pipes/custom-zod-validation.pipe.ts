import { UnprocessableEntityException } from '@nestjs/common'
import { createZodValidationPipe } from 'nestjs-zod'
import { ZodError } from 'zod'

const MyZodValidationPipe = createZodValidationPipe({
  // provide custom validation exception factory
  createValidationException: (error: ZodError) => {
    console.log(error.errors)

    return new UnprocessableEntityException(
      error.errors.map((error) => {
        return {
          ...error,
          path: error.path.join('.'),
        }
      }),
    )
  },
})

export default MyZodValidationPipe
