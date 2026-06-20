import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { Observable, map } from 'rxjs';

@Injectable()
export class ApiResponseInterceptor implements NestInterceptor {
  intercept(_context: ExecutionContext, next: CallHandler): Observable<unknown> {
    return next.handle().pipe(
      map((value) => {
        if (value?.success !== undefined) return value;
        if (value?.data !== undefined && value?.meta !== undefined) {
          return { success: true, ...value };
        }
        return { success: true, data: value ?? null };
      }),
    );
  }
}
