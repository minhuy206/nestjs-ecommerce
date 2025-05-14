import { NotFoundException, UnprocessableEntityException } from '@nestjs/common'

export const RoleAlreadyExistsException = new UnprocessableEntityException([
  {
    message: 'Error.RoleAlreadyExists',
    path: 'name',
  },
])

export const RoleNotFoundException = new NotFoundException('Error.RoleNotFound')

export const ProhibitedActionOnBaseRoleException = new UnprocessableEntityException('Error.ProhibitedActionOnBaseRole')
