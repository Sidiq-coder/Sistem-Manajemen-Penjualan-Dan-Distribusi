import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { verify, hash } from 'argon2';
import { createHash, randomBytes } from 'node:crypto';
import { PrismaService } from '../../database/prisma.service';
import { AuditService } from '../audit/audit.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
    private readonly audit: AuditService,
  ) {}

  async login(
    email: string,
    password: string,
    context?: { ipAddress?: string; requestId?: string },
  ) {
    const user = await this.prisma.user.findFirst({
      where: { email, deletedAt: null, status: 'ACTIVE' },
      include: { roles: { include: { role: true } } },
    });
    if (!user || !(await verify(user.passwordHash, password))) {
      await this.audit.record({
        action: 'AUTH_LOGIN_FAILED',
        entity: 'User',
        metadata: { email },
        ...context,
      });
      throw new UnauthorizedException('Email atau password salah');
    }

    const payload = {
      sub: user.id,
      email: user.email,
      roles: user.roles.map(({ role }) => role.code),
    };
    const [accessToken, refreshToken] = await Promise.all([
      this.jwt.signAsync(payload, {
        secret: this.config.getOrThrow<string>('JWT_ACCESS_SECRET'),
        expiresIn: this.config.get<string>('JWT_ACCESS_TTL', '15m') as any,
      }),
      this.jwt.signAsync(
        { sub: user.id, type: 'refresh' },
        {
          secret: this.config.getOrThrow<string>('JWT_REFRESH_SECRET'),
          expiresIn: this.config.get<string>('JWT_REFRESH_TTL', '7d') as any,
        },
      ),
    ]);

    await this.prisma.user.update({
      where: { id: user.id },
      data: { refreshTokenHash: await hash(refreshToken), lastLoginAt: new Date() },
    });
    await this.audit.record({
      actorId: user.id,
      action: 'AUTH_LOGIN',
      entity: 'User',
      entityId: user.id,
      ...context,
    });

    return {
      accessToken,
      refreshToken,
      user: { id: user.id, email: user.email, name: user.name, roles: payload.roles },
    };
  }

  async refresh(refreshToken: string) {
    try {
      const payload = await this.jwt.verifyAsync<{ sub: string; type: string }>(refreshToken, {
        secret: this.config.getOrThrow<string>('JWT_REFRESH_SECRET'),
      });
      const user = await this.prisma.user.findUnique({
        where: { id: payload.sub },
        include: { roles: { include: { role: true } } },
      });
      if (!user?.refreshTokenHash || !(await verify(user.refreshTokenHash, refreshToken))) {
        throw new UnauthorizedException('Refresh token tidak valid');
      }
      const roles = user.roles.map(({ role }) => role.code);
      const accessToken = await this.jwt.signAsync(
        { sub: user.id, email: user.email, roles },
        {
          secret: this.config.getOrThrow<string>('JWT_ACCESS_SECRET'),
          expiresIn: this.config.get<string>('JWT_ACCESS_TTL', '15m') as any,
        },
      );
      return { accessToken };
    } catch {
      throw new UnauthorizedException('Refresh token tidak valid');
    }
  }

  async logout(userId: string) {
    await this.prisma.user.update({ where: { id: userId }, data: { refreshTokenHash: null } });
    await this.audit.record({
      actorId: userId,
      action: 'AUTH_LOGOUT',
      entity: 'User',
      entityId: userId,
    });
  }

  async forgotPassword(email: string) {
    const user = await this.prisma.user.findFirst({
      where: { email, deletedAt: null, status: 'ACTIVE' },
    });
    if (!user) return { accepted: true };
    const token = randomBytes(32).toString('hex');
    const tokenHash = createHash('sha256').update(token).digest('hex');
    await this.prisma.passwordResetToken.create({
      data: {
        userId: user.id,
        tokenHash,
        expiresAt: new Date(Date.now() + 30 * 60 * 1000),
      },
    });
    await this.audit.record({
      actorId: user.id,
      action: 'PASSWORD_RESET_REQUESTED',
      entity: 'User',
      entityId: user.id,
    });
    return {
      accepted: true,
      ...(this.config.get<string>('NODE_ENV') === 'development' ? { developmentToken: token } : {}),
    };
  }

  async resetPassword(token: string, password: string) {
    const tokenHash = createHash('sha256').update(token).digest('hex');
    const reset = await this.prisma.passwordResetToken.findUnique({
      where: { tokenHash },
    });
    if (!reset || reset.usedAt || reset.expiresAt < new Date()) {
      throw new UnauthorizedException('Token reset tidak valid atau kedaluwarsa');
    }
    await this.prisma.$transaction([
      this.prisma.user.update({
        where: { id: reset.userId },
        data: { passwordHash: await hash(password), refreshTokenHash: null },
      }),
      this.prisma.passwordResetToken.update({
        where: { id: reset.id },
        data: { usedAt: new Date() },
      }),
    ]);
    await this.audit.record({
      actorId: reset.userId,
      action: 'PASSWORD_RESET_COMPLETED',
      entity: 'User',
      entityId: reset.userId,
    });
    return { reset: true };
  }

  async profile(userId: string) {
    return this.prisma.user.findUniqueOrThrow({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        status: true,
        roles: { select: { role: { select: { code: true, name: true } } } },
      },
    });
  }
}
