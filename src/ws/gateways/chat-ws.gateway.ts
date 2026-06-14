import { JwtService } from '@nestjs/jwt';
import {
  SubscribeMessage,
  WebSocketGateway,
  MessageBody,
  ConnectedSocket,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { SocketAuthMiddleware } from '../websocket.middleware';
import { Logger } from '@nestjs/common';
import { BaseWsGateway } from 'src/core/common/websocket/base-ws.gateway';
import { ForumConversationCreatedEvent } from '../events/forum-conversation.event';
import { inspect } from 'node:util';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class ChatWsGateway extends BaseWsGateway {
  private readonly logger = new Logger(ChatWsGateway.name);
  private readonly className = 'ChatWsGateway';

  constructor(private readonly jwtService: JwtService) {
    super();
  }

  getLogger(): Logger {
    return this.logger;
  }

  @WebSocketServer()
  server: Server;

  afterInit(client: Socket) {
    client.use(SocketAuthMiddleware(this.jwtService));
    this.logger.debug('Websocket gateway initialized successfully');
  }

  @SubscribeMessage('message')
  async broadcastToClasses(
    @MessageBody()
    payload: {
      classId: string;
      data: any;
    },
  ) {
    const room = [`class-forum:${payload.classId}`];
    await this.broadcastFromServer(
      this.server,
      room,
      new ForumConversationCreatedEvent({
        data: payload.data,
      }),
    );
    this.logger.debug(`broadcasted to ${inspect(room)}`);
  }

  @SubscribeMessage('join.class.conversations')
  async handleForumClassConnection(
    @MessageBody() classId: string,
    @ConnectedSocket() client: Socket,
  ) {
    const methodName = 'handleConnection';
    this.logger.debug(
      `[${this.className}/${methodName}] - New client (${classId}) connected. id: ${client.id}`,
    );

    await client.join(`class-forum:${classId}`);

    this.logger.debug(
      `[${this.className}/${methodName}] - successfully joined ${inspect(client.rooms)}`,
    );
  }
}
