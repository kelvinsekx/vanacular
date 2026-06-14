import { JwtService } from '@nestjs/jwt';
import { WebSocketGuard } from './websocket.guard';
import { Socket } from 'socket.io';

type SocketIOMiddleware = {
  (client: Socket, next: (err?: Error) => void);
};

export const SocketAuthMiddleware = (jwtService: JwtService) => {
  return (client, next) => {
    try {
      WebSocketGuard.validateToken(client, jwtService);
      next();
    } catch (error) {
      next(error);
    }
  };
};
