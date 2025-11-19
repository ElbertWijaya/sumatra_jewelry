import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { RealtimeService } from '../realtime/realtime.service';

@Module({
  imports: [ConfigModule],
  providers: [RealtimeService],
  exports: [RealtimeService],
})
export class RealtimeModule {}
