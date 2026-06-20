import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { ZodError } from 'zod';

@Catch()
export class ApiExceptionFilter implements ExceptionFilter {
  catch(error: unknown, host: ArgumentsHost) {
    const response = host.switchToHttp().getResponse();
    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let code = 'INTERNAL_ERROR';
    let message = 'Terjadi kesalahan pada server';
    let details: unknown[] | undefined;

    if (error instanceof HttpException) {
      status = error.getStatus();
      const body = error.getResponse();
      code = status === 401 ? 'UNAUTHORIZED' : status === 403 ? 'FORBIDDEN' : 'HTTP_ERROR';
      message =
        typeof body === 'string' ? body : ((body as { message?: string }).message ?? message);
    } else if (error instanceof ZodError) {
      status = HttpStatus.BAD_REQUEST;
      code = 'VALIDATION_ERROR';
      message = 'Input tidak valid';
      details = error.issues;
    } else if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      status = HttpStatus.CONFLICT;
      code = 'DUPLICATE_DATA';
      message = 'Data unik sudah digunakan';
    }

    response.status(status).json({
      success: false,
      error: { code, message, ...(details ? { details } : {}) },
    });
  }
}
