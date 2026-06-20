import { BadRequestException, Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { hash } from 'argon2';
import { paginationMeta } from '../../common/pagination';
import { PrismaService } from '../../database/prisma.service';
import { AuditService } from '../audit/audit.service';

@Injectable()
export class UsersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
  ) {}

  async list(query: { page: number; limit: number; search?: string }) {
    const where: Prisma.UserWhereInput = {
      deletedAt: null,
      ...(query.search
        ? {
            OR: [
              { name: { contains: query.search, mode: 'insensitive' } },
              { email: { contains: query.search, mode: 'insensitive' } },
            ],
          }
        : {}),
    };
    const [data, total] = await this.prisma.$transaction([
      this.prisma.user.findMany({
        where,
        select: {
          id: true,
          name: true,
          email: true,
          status: true,
          lastLoginAt: true,
          createdAt: true,
          roles: { select: { role: { select: { id: true, code: true, name: true } } } },
        },
        skip: (query.page - 1) * query.limit,
        take: query.limit,
      }),
      this.prisma.user.count({ where }),
    ]);
    return { data, meta: paginationMeta(query.page, query.limit, total) };
  }

  async create(data: any, actorId: string) {
    if (data.roleCodes.includes('SUPER_ADMIN')) {
      throw new BadRequestException('Role SUPER_ADMIN tidak dapat dibuat melalui fitur ini');
    }
    const foundRoles = await this.prisma.role.findMany({ where: { code: { in: data.roleCodes } } });
    if (foundRoles.length !== data.roleCodes.length)
      throw new BadRequestException('Role tidak valid');
    const user = await this.prisma.user.create({
      data: {
        name: data.name,
        email: data.email,
        passwordHash: await hash(data.password),
        roles: { create: foundRoles.map((role) => ({ roleId: role.id })) },
      },
      select: { id: true, name: true, email: true, status: true },
    });
    await this.audit.record({
      actorId,
      action: 'USER_CREATED',
      entity: 'User',
      entityId: user.id,
      metadata: { roleCodes: data.roleCodes },
    });
    return user;
  }

  async update(id: string, data: any, actorId: string) {
    const { roleCodes, ...userData } = data;
    const user = await this.prisma.$transaction(async (tx) => {
      const updated = await tx.user.update({ where: { id }, data: userData });
      if (roleCodes) {
        const foundRoles = await tx.role.findMany({ where: { code: { in: roleCodes } } });
        if (foundRoles.length !== roleCodes.length)
          throw new BadRequestException('Role tidak valid');
        await tx.userRole.deleteMany({ where: { userId: id } });
        await tx.userRole.createMany({
          data: foundRoles.map((role) => ({ userId: id, roleId: role.id })),
        });
      }
      return updated;
    });
    await this.audit.record({
      actorId,
      action: roleCodes ? 'USER_ROLES_CHANGED' : 'USER_UPDATED',
      entity: 'User',
      entityId: id,
      metadata: roleCodes ? { roleCodes } : { changedFields: Object.keys(userData) },
    });
    return { id: user.id, name: user.name, email: user.email, status: user.status };
  }

  async remove(id: string, actorId: string) {
    if (id === actorId) throw new BadRequestException('Tidak dapat menonaktifkan akun sendiri');
    const user = await this.prisma.user.update({
      where: { id },
      data: { deletedAt: new Date(), status: 'DISABLED', refreshTokenHash: null },
    });
    await this.audit.record({
      actorId,
      action: 'USER_ARCHIVED',
      entity: 'User',
      entityId: id,
    });
    return { id: user.id, disabled: true };
  }

  listRoles() {
    return this.prisma.role.findMany({
      include: { permissions: { include: { permission: true } } },
      orderBy: { name: 'asc' },
    });
  }

  async updatePermissions(roleId: string, permissionCodes: string[], actorId: string) {
    const permissions = await this.prisma.permission.findMany({
      where: { code: { in: permissionCodes } },
    });
    if (permissions.length !== permissionCodes.length) {
      throw new BadRequestException('Permission tidak valid');
    }
    await this.prisma.$transaction([
      this.prisma.rolePermission.deleteMany({ where: { roleId } }),
      this.prisma.rolePermission.createMany({
        data: permissions.map((permission) => ({ roleId, permissionId: permission.id })),
      }),
    ]);
    await this.audit.record({
      actorId,
      action: 'ROLE_PERMISSIONS_CHANGED',
      entity: 'Role',
      entityId: roleId,
      metadata: { permissionCodes },
    });
    return this.prisma.role.findUniqueOrThrow({
      where: { id: roleId },
      include: { permissions: { include: { permission: true } } },
    });
  }
}
