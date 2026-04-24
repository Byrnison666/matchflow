import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { PresenceService } from './presence.service';
import { Message } from '../matches/entities/message.entity';

@WebSocketGateway({
  cors: {
    origin: (origin: string, callback: (err: Error | null, allow?: boolean) => void) => {
      callback(null, true);
    },
    credentials: true,
  },
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  private server: Server;

  private readonly socketUserMap = new Map<string, string>();

  constructor(
    private readonly jwtService: JwtService,
    private readonly config: ConfigService,
    private readonly presenceService: PresenceService,
  ) {}

  async handleConnection(client: Socket) {
    const token = client.handshake.auth?.token as string;
    if (!token) {
      client.disconnect(true);
      return;
    }

    try {
      const payload = this.jwtService.verify(token, {
        secret: this.config.get<string>('JWT_ACCESS_SECRET'),
      });
      const userId: string = payload.sub;

      client.data.userId = userId;
      this.socketUserMap.set(client.id, userId);
      this.presenceService.setOnline(userId, client.id);

      client.emit('connected', { userId });
      this.server.emit('presence:update', {
        userId,
        isOnline: true,
      });
    } catch {
      client.disconnect(true);
    }
  }

  handleDisconnect(client: Socket) {
    const userId = this.socketUserMap.get(client.id);
    if (userId) {
      this.socketUserMap.delete(client.id);
      this.presenceService.setOffline(userId);
      this.server.emit('presence:update', {
        userId,
        isOnline: false,
        lastSeenAt: new Date(),
      });
    }
  }

  @SubscribeMessage('chat:join')
  handleJoin(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { matchId: string },
  ) {
    if (!data?.matchId) return;
    client.join(`match:${data.matchId}`);
    client.emit('chat:joined', { matchId: data.matchId });
  }

  @SubscribeMessage('chat:leave')
  handleLeave(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { matchId: string },
  ) {
    if (!data?.matchId) return;
    client.leave(`match:${data.matchId}`);
    client.emit('chat:left', { matchId: data.matchId });
  }

  emitMessage(matchId: string, message: Message) {
    this.server.to(`match:${matchId}`).emit('chat:message', message);
  }
}
