import { Controller, Get } from '@nestjs/common';

// Dengan global prefix 'api' di main.ts, route ini akan tersedia di /api/health
@Controller('health')
export class HealthController {
  @Get()
  get() {
    return { status: 'ok' };
  }
}
