import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule } from '@nestjs/config';
import { RedisModule } from '@nestjs-modules/ioredis';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { AuthService } from './auth/auth.service';
import { ClassRepository } from './core/common/classes.repository';

import { jwtConstants } from './auth/constants';
import { PrismaModule } from './prisma.service';
import { ForumModule } from './core/forum/forum.module';
import { MessageModule } from './message/message.module';

import { LanguagesService } from './languages/languages.service';
import { LanguageRepository } from './core/common/language.repository';

@Module({
  imports: [
    ConfigModule.forRoot({}),
    JwtModule.register({
      secret: jwtConstants.secret,
      signOptions: { expiresIn: '8h' },
    }),
    RedisModule.forRoot({
      type: 'single',
      url: 'redis://localhost:6379',
      onClientReady: (client) => {
        client.on('error', (err) => console.log('Redis error:', err));
      },
    }),
    AuthModule,
    UsersModule,
    PrismaModule,
    ForumModule,
    MessageModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    AuthService,
    ClassRepository,
    LanguagesService,
    LanguageRepository,
  ],
})
export class AppModule {}
