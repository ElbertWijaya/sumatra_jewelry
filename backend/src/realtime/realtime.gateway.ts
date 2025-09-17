import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { OnGatewayConnection, OnGatewayDisconnect, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({ cors: { origin: '*'} })
@Injectable()
export class RealtimeGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() server!: Server;
  private readonly logger = new Logger(RealtimeGateway.name);

  constructor(private config: ConfigService) {}

  handleConnection(client: Socket) {
    try {
      const userId = (client.handshake.auth && client.handshake.auth.userId) || (client.handshake.query && (client.handshake.query as any).userId);
      if (userId) {
        client.join(`user:${userId}`);
        this.logger.debug(`client connected user=${userId} id=${client.id}`);
      } else {
        this.logger.warn(`client connected without userId id=${client.id}`);
      }
    } catch (e) {
      this.logger.error('handleConnection error', e as any);
    }
  }

  handleDisconnect(client: Socket) {
    this.logger.debug(`client disconnected id=${client.id}`);
  }

  emitToUser(userId: string, event: string, payload: any) {
    this.server.to(`user:${userId}`).emit(event, payload);
  }

  emitBroadcast(event: string, payload: any) {
    this.server.emit(event, payload);
  }
}
