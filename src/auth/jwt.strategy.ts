import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { type Request } from 'express';
import { jwtConstants } from './constants';

import Redis from 'ioredis';
import { InjectRedis } from '@nestjs-modules/ioredis';
import { type User } from 'src/generated/prisma/client';

type UserPayload = {
  userId: string;
  email: string;
  jti: string;
  expiry: number;
  role: string;
  classes: Record<string, any>;
};

export interface RequestWithPassportUser extends Request {
  user: UserPayload;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(@InjectRedis() private readonly redis: Redis) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: jwtConstants.secret,
    });
  }

  async validate(
    payload: User & {
      sub: string;
      exp: number;
      jti: string;
      class: Array<any>;
    },
  ): Promise<RequestWithPassportUser['user']> {
    const blacklisted = await this.redis.exists(`jwt:${payload.jti}`);
    if (blacklisted === 1) {
      throw new UnauthorizedException();
    }

    return {
      classes: payload.class,
      userId: payload.sub,
      email: payload.email,
      jti: payload.jti,
      expiry: payload.exp,
      role: payload.role,
    };
  }
}
