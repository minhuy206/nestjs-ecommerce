import { Module } from '@nestjs/common'
import { RoleController } from 'src/routes/role/role.controller'
import { RoleRepository } from 'src/routes/role/role.repo'
import { RoleService } from 'src/routes/role/role.service'

@Module({
  providers: [RoleService, RoleRepository],
  controllers: [RoleController],
  exports: [RoleService],
})
export class RoleModule {}
