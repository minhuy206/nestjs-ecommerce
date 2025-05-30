import { Injectable } from '@nestjs/common'
import { ProhibitedActionOnBaseRoleException, RoleAlreadyExistsException } from 'src/routes/role/role.error'
import { CreateRoleBodyType, GetRolesQueryType, UpdateRoleBodyType } from 'src/routes/role/role.model'
import { RoleRepository } from 'src/routes/role/role.repo'
import { RoleName } from 'src/shared/constants/role.constant'
import { NotFoundRecordException } from 'src/shared/error'
import { isNotFoundPrismaError, isUniqueConstraintPrismaError } from 'src/shared/helpers'

@Injectable()
export class RoleService {
  constructor(private roleRepository: RoleRepository) {}

  private async verifyRole(roleId: number) {
    const role = await this.roleRepository.findById(roleId)
    if (!role) {
      throw NotFoundRecordException
    }

    if ([RoleName.admin, RoleName.client, RoleName.seller].toString().includes(role.name)) {
      throw ProhibitedActionOnBaseRoleException
    }
  }

  async list(pagination: GetRolesQueryType) {
    const data = await this.roleRepository.list(pagination)
    return data
  }

  async findById(id: number) {
    const role = await this.roleRepository.findById(id)
    if (!role) {
      throw NotFoundRecordException
    }
    return role
  }

  async create({ data, createdById }: { data: CreateRoleBodyType; createdById: number }) {
    try {
      const role = await this.roleRepository.create({
        createdById,
        data,
      })
      return role
    } catch (error) {
      if (isUniqueConstraintPrismaError(error)) {
        throw RoleAlreadyExistsException
      }
      throw error
    }
  }

  async update({ id, data, updatedById }: { id: number; data: UpdateRoleBodyType; updatedById: number }) {
    try {
      await this.verifyRole(id)
      const role = await this.roleRepository.update({
        id,
        updatedById,
        data,
      })
      return role
    } catch (error) {
      if (isNotFoundPrismaError(error)) {
        throw NotFoundRecordException
      }
      if (isUniqueConstraintPrismaError(error)) {
        throw RoleAlreadyExistsException
      }
      throw error
    }
  }

  async delete({ id, deletedById }: { id: number; deletedById: number }) {
    try {
      await this.verifyRole(id)

      await this.roleRepository.delete({
        id,
        deletedById,
      })
      return {
        message: 'Delete successfully',
      }
    } catch (error) {
      if (isNotFoundPrismaError(error)) {
        throw NotFoundRecordException
      }
      throw error
    }
  }
}
