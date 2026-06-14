import { Module } from '@nestjs/common';
import { RedisModule as RdModule } from '@nestjs-modules/ioredis';

@Module({
  imports: [
    RdModule.forRoot({
      type: 'single',
      url: process.env.REDIS_URL || 'redis://localhost:6379',
      onClientReady: (client) => {
        client.on('error', (err) => console.log('Redis error:', err));
      },
    }),
  ],
})
export class RedisModule {}
