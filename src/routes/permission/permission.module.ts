import { Module } from '@nestjs/common'
import { PermissionController } from 'src/routes/permission/permission.controller'
import { PermissionRepository } from 'src/routes/permission/permission.repo'
import { PermissionService } from 'src/routes/permission/permission.service'

@Module({
  providers: [PermissionService, PermissionRepository],
  controllers: [PermissionController],
})
export class PermissionModule {}
