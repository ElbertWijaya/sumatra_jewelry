import { ConfigService } from '@nestjs/config';
import { OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
export declare class RealtimeGateway implements OnGatewayConnection, OnGatewayDisconnect {
    private config;
    server: Server;
    private readonly logger;
    constructor(config: ConfigService);
    handleConnection(client: Socket): void;
    handleDisconnect(client: Socket): void;
    emitToUser(userId: string, event: string, payload: any): void;
    emitBroadcast(event: string, payload: any): void;
}
