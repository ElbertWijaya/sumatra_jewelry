"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var RealtimeGateway_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.RealtimeGateway = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const websockets_1 = require("@nestjs/websockets");
const socket_io_1 = require("socket.io");
let RealtimeGateway = RealtimeGateway_1 = class RealtimeGateway {
    constructor(config) {
        this.config = config;
        this.logger = new common_1.Logger(RealtimeGateway_1.name);
    }
    handleConnection(client) {
        try {
            const userId = (client.handshake.auth && client.handshake.auth.userId) || (client.handshake.query && client.handshake.query.userId);
            if (userId) {
                client.join(`user:${userId}`);
                this.logger.debug(`client connected user=${userId} id=${client.id}`);
            }
            else {
                this.logger.warn(`client connected without userId id=${client.id}`);
            }
        }
        catch (e) {
            this.logger.error('handleConnection error', e);
        }
    }
    handleDisconnect(client) {
        this.logger.debug(`client disconnected id=${client.id}`);
    }
    emitToUser(userId, event, payload) {
        this.server.to(`user:${userId}`).emit(event, payload);
    }
    emitBroadcast(event, payload) {
        this.server.emit(event, payload);
    }
};
exports.RealtimeGateway = RealtimeGateway;
__decorate([
    (0, websockets_1.WebSocketServer)(),
    __metadata("design:type", socket_io_1.Server)
], RealtimeGateway.prototype, "server", void 0);
exports.RealtimeGateway = RealtimeGateway = RealtimeGateway_1 = __decorate([
    (0, websockets_1.WebSocketGateway)({ cors: { origin: '*' } }),
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], RealtimeGateway);
//# sourceMappingURL=realtime.gateway.js.map