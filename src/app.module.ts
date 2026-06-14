import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule } from '@nestjs/config';

import { AppController } from './app.controller';
import { AppService } from './app.service';

import { ClassRepository } from './core/common/classes.repository';

import { LanguageRepository } from './core/common/language.repository';

import { PrismaModule } from './infra/database/prisma.service';
import { RedisModule } from './infra/redis/redis.module';

import { MessageModule } from './application/message/message.module';
import { LanguagesService } from './application/languages/languages.service';
import { LessonsModule } from './application/lessons/lessons.module';
import { ActivitiesModule } from './application/activities/activities.module';
import { FileModule } from './application/file/file.module';
import { LanguagesController } from './application/languages/languages.controller';
import { jwtConstants } from './application/auth/constants';
import { AuthModule } from './application/auth/auth.module';
import { UsersModule } from './application/users/users.module';
import { AuthService } from './application/auth/auth.service';
import { ChatWsGateway } from './ws/gateways/chat-ws.gateway';
import { ForumModule } from './application/forum/forum.module';

@Module({
  imports: [
    ConfigModule.forRoot({}),
    JwtModule.register({
      global: true,
      secret: jwtConstants.secret,
      signOptions: { expiresIn: '8h' },
    }),
    RedisModule,
    AuthModule,
    UsersModule,
    PrismaModule,
    ForumModule,
    MessageModule,
    LessonsModule,
    ActivitiesModule,
    FileModule,
  ],
  controllers: [AppController, LanguagesController],
  providers: [
    AppService,
    AuthService,
    ClassRepository,
    LanguagesService,
    LanguageRepository,
    ChatWsGateway,
  ],
})
export class AppModule {}
