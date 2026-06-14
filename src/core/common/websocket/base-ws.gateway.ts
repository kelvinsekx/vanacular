import { Server, Socket } from 'socket.io';
import { BaseWsEvent } from './base-ws-event';
import { Logger } from '@nestjs/common';
import { inspect } from 'util';

export abstract class BaseWsGateway {
  abstract getLogger(): Logger;

  async broadcastFromClient<T>(
    client: Socket,
    rooms: Array<string>,
    event: BaseWsEvent<T>,
  ) {
    if (rooms.length === 0) {
      this.getLogger().log(`
           Room is empty; Skipping broadcast for event ${event.eventName} 
            `);
      return {
        success: true,
        data: false,
      };
    }

    this.getLogger().debug(
      `Broadcasting event ${event.eventName} to rooms ${rooms}: ${inspect(event.data)}`,
    );
    client.broadcast.to(rooms).emit(event.eventName, event.data);

    return {
      success: true,
      data: true,
    };
  }

  async broadcastFromServer<T>(
    client: Server,
    rooms: Array<string>,
    event: BaseWsEvent<T>,
  ) {
    if (rooms.length === 0) {
      this.getLogger().log(`
           Room is empty; Skipping broadcast for event ${event.eventName} 
            `);
      return {
        success: true,
        data: false,
      };
    }

    this.getLogger().debug(
      `Broadcasting event ${event.eventName} to rooms ${rooms}: ${inspect(event.data)}`,
    );
    client.to(rooms).emit(event.eventName, event.data);

    return {
      success: true,
      data: true,
    };
  }
}
