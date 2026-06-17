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
      options: {
        retryStrategy(times) {
          Math.min(times * 50, 2000);
        },
      },
    }),
  ],
})
export class RedisModule {}
