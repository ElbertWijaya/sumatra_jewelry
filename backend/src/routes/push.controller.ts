import { Body, Controller, Post, Delete } from '@nestjs/common';
import { PushService } from '../services/push.service';
import { CurrentUser } from '../security/current-user.decorator';
import { RequestUser } from '../types/order.dtos';

@Controller('push')
export class PushController {
  constructor(private push: PushService) {}

  @Post('register')
  async register(@Body() body: { token: string; provider?: 'expo'|'fcm'; platform?: string }, @CurrentUser() user: RequestUser) {
    const provider = body.provider || 'expo';
    return this.push.register(user.userId, body.token, provider, body.platform);
  }

  @Delete('unregister')
  async unregister(@Body() body: { token: string }) {
    return this.push.unregister(body.token);
  }
}
