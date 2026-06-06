import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UsersModule } from 'src/users/users.module';
import { LocalStrategy } from './local.strategy';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { JwtStrategy } from './jwt.strategy';
import { LanguagesService } from 'src/languages/languages.service';
import { LanguageRepository } from 'src/core/common/language.repository';

@Module({
  imports: [UsersModule, PassportModule, JwtModule],
  providers: [
    AuthService,
    LocalStrategy,
    JwtStrategy,
    LanguagesService,
    LanguageRepository,
  ],
  exports: [AuthService],
})
export class AuthModule {}
