import { Body, Controller, Get, Post, Req, Res } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { Request, Response } from 'express';
import { loginSchema } from '@smpd/shared';
import { z } from 'zod';
import { CurrentUser, type AuthUser } from '../../common/current-user.decorator';
import { ZodValidationPipe } from '../../common/zod-validation.pipe';
import { AuthService } from './auth.service';
import { Public } from './public.decorator';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly auth: AuthService,
    private readonly config: ConfigService,
  ) {}

  @Public()
  @Post('login')
  async login(
    @Body(new ZodValidationPipe(loginSchema)) body: { email: string; password: string },
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
  ) {
    const result = await this.auth.login(body.email, body.password, {
      ipAddress: request.ip,
      requestId: request.headers['x-request-id'] as string,
    });
    this.setCookie(response, 'access_token', result.accessToken, 15 * 60 * 1000);
    this.setCookie(response, 'refresh_token', result.refreshToken, 7 * 24 * 60 * 60 * 1000);
    return { user: result.user };
  }

  @Public()
  @Post('refresh')
  async refresh(@Req() request: Request, @Res({ passthrough: true }) response: Response) {
    const result = await this.auth.refresh(request.cookies?.refresh_token as string);
    this.setCookie(response, 'access_token', result.accessToken, 15 * 60 * 1000);
    return { refreshed: true };
  }

  @Public()
  @Post('forgot-password')
  forgotPassword(
    @Body(
      new ZodValidationPipe(
        z.object({ email: z.email().transform((value) => value.toLowerCase()) }),
      ),
    )
    body: {
      email: string;
    },
  ) {
    return this.auth.forgotPassword(body.email);
  }

  @Public()
  @Post('reset-password')
  resetPassword(
    @Body(
      new ZodValidationPipe(
        z.object({
          token: z.string().min(32),
          password: z.string().min(8).max(128),
        }),
      ),
    )
    body: {
      token: string;
      password: string;
    },
  ) {
    return this.auth.resetPassword(body.token, body.password);
  }

  @Post('logout')
  async logout(@CurrentUser() user: AuthUser, @Res({ passthrough: true }) response: Response) {
    await this.auth.logout(user.sub);
    response.clearCookie('access_token', { path: '/' });
    response.clearCookie('refresh_token', { path: '/api/auth' });
    return { loggedOut: true };
  }

  @Get('me')
  profile(@CurrentUser() user: AuthUser) {
    return this.auth.profile(user.sub);
  }

  private setCookie(response: Response, name: string, value: string, maxAge: number) {
    response.cookie(name, value, {
      httpOnly: true,
      secure: this.config.get<boolean>('COOKIE_SECURE', false),
      sameSite: 'lax',
      path: name === 'refresh_token' ? '/api/auth' : '/',
      maxAge,
    });
  }
}
