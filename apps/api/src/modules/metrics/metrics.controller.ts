import { Controller, Get, Res } from '@nestjs/common';
import { collectDefaultMetrics, register } from 'prom-client';
import type { Response } from 'express';
import { Public } from '../auth/public.decorator';

collectDefaultMetrics({ prefix: 'smpd_api_' });

@Controller('metrics')
export class MetricsController {
  @Public()
  @Get()
  async metrics(@Res() response: Response) {
    response.type(register.contentType).send(await register.metrics());
  }
}
