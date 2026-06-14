import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
  Logger,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Observable } from 'rxjs';
import { Socket } from 'socket.io';
import { getErrorMessage } from 'src/core/utils/uti';

@Injectable()
export class WebSocketGuard implements CanActivate {
  constructor(private readonly jwtService: JwtService) {}

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    if (context.getType() !== 'ws') {
      return true;
    }

    const client: Socket = context.switchToWs().getClient();

    WebSocketGuard.validateToken(client, this.jwtService);
    return true;
  }

  static validateToken(client: Socket, jwtService: JwtService) {
    const logger = new Logger();
    try {
      const token = client.handshake.auth.token as string;
      logger.log(`[WebSocketGuard/validateToken] - trying to authorize`);
      const payload = jwtService.verify(token);
      return payload;
    } catch (error) {
      logger.debug(
        `[WebSocketGuard/validateToken] - Error from authentication: ${getErrorMessage(error)}, disconnecting...`,
      );
      client.emit('appError', getErrorMessage(error));
      client.disconnect(true);
      throw new UnauthorizedException();
    }
  }
}
