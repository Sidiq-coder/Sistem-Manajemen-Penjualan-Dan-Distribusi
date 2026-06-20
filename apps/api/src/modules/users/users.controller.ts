import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { paginationSchema, roles } from '@smpd/shared';
import { z } from 'zod';
import { CurrentUser, type AuthUser } from '../../common/current-user.decorator';
import { ZodValidationPipe } from '../../common/zod-validation.pipe';
import { Roles } from '../auth/roles.decorator';
import { UsersService } from './users.service';

const userSchema = z.object({
  name: z.string().trim().min(2).max(150),
  email: z.email().transform((value) => value.toLowerCase()),
  password: z.string().min(8).max(128),
  roleCodes: z
    .array(z.enum(roles))
    .min(1)
    .refine((codes) => !codes.includes('SUPER_ADMIN'), {
      message: 'Role SUPER_ADMIN tidak dapat dibuat melalui endpoint ini',
    }),
});
const userUpdateSchema = z.object({
  name: z.string().trim().min(2).max(150).optional(),
  email: z
    .email()
    .transform((value) => value.toLowerCase())
    .optional(),
  status: z.enum(['ACTIVE', 'DISABLED', 'LOCKED']).optional(),
  roleCodes: z.array(z.enum(roles)).min(1).optional(),
});
const rolePermissionsSchema = z.object({
  permissionCodes: z.array(z.string().min(3).max(100)),
});

@Roles('SUPER_ADMIN', 'ADMIN')
@Controller('users')
export class UsersController {
  constructor(private readonly users: UsersService) {}

  @Get()
  list(@Query(new ZodValidationPipe(paginationSchema)) query: any) {
    return this.users.list(query);
  }

  @Post()
  @Roles('SUPER_ADMIN')
  create(@Body(new ZodValidationPipe(userSchema)) body: any, @CurrentUser() actor: AuthUser) {
    return this.users.create(body, actor.sub);
  }

  @Patch(':id')
  @Roles('SUPER_ADMIN')
  update(
    @Param('id') id: string,
    @Body(new ZodValidationPipe(userUpdateSchema)) body: any,
    @CurrentUser() actor: AuthUser,
  ) {
    return this.users.update(id, body, actor.sub);
  }

  @Delete(':id')
  @Roles('SUPER_ADMIN')
  remove(@Param('id') id: string, @CurrentUser() actor: AuthUser) {
    return this.users.remove(id, actor.sub);
  }
}

@Roles('SUPER_ADMIN', 'ADMIN')
@Controller('roles')
export class RolesController {
  constructor(private readonly users: UsersService) {}

  @Get()
  list() {
    return this.users.listRoles();
  }

  @Patch(':id/permissions')
  @Roles('SUPER_ADMIN')
  permissions(
    @Param('id') id: string,
    @Body(new ZodValidationPipe(rolePermissionsSchema)) body: any,
    @CurrentUser() actor: AuthUser,
  ) {
    return this.users.updatePermissions(id, body.permissionCodes, actor.sub);
  }
}
