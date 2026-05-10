import {
  Injectable,
  BadRequestException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { v4 as uuidv4 } from 'uuid';
import * as bcrypt from 'bcrypt';
import Redis from 'ioredis';
import { InjectRedis } from '@nestjs-modules/ioredis';
import { UsersService } from 'src/users/users.service';
import { LoginDto } from 'src/users/users.dto';
import { User, Prisma } from 'src/generated/prisma/client';

type TokenExpiry = {
  token: string;
  expiry: number;
};

@Injectable()
export class AuthService {
  passwordService = new PasswordService();

  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    @InjectRedis() private readonly redis: Redis,
  ) {}

  async validateUser(
    email: string,
    password: string,
  ): Promise<Partial<User> | null> {
    const user = await this.usersService.findOneByEmail(email);

    if (!user) throw new BadRequestException('can not find user');

    const isTaly = await this.passwordService.compareHashPassword(
      password,
      user.password,
    );
    if (user && isTaly) {
      const data: Partial<User> = { ...user };
      delete data.password;
      return data;
    }

    return null;
  }

  async login(user: LoginDto) {
    if (!user) throw new UnauthorizedException();

    const loggedInUser = await this.usersService.findOneByEmail(user.email);

    const payload = {
      class: loggedInUser?.memberships,
      email: loggedInUser?.email,
      sub: loggedInUser?.id,
      jti: uuidv4(),
      role: loggedInUser?.role,
    };

    return {
      access_token: this.jwtService.sign(payload),
    };
  }

  async signup(firstTimeUser: Prisma.UserCreateInput) {
    const user = await this.usersService.findOneByEmail(firstTimeUser.email);

    if (user)
      throw new BadRequestException({
        message: 'user already exist',
        field: `C ${AuthService.name} signup`,
      });

    const hashedPassword = await this.passwordService.hassPasword(
      firstTimeUser.password,
    );
    firstTimeUser = { ...firstTimeUser, password: hashedPassword };

    await this.usersService.registerUser(firstTimeUser);

    return this.login(firstTimeUser);
  }

  async logout({ token, expiry }: TokenExpiry) {
    return await this.blacklistToken({ token, expiry });
  }

  async blacklistToken({ token, expiry }: TokenExpiry) {
    const ttl = Math.floor(expiry) - Math.floor(Date.now() / 1000);

    if (ttl > 0) {
      await this.redis.set(`jwt:${token}`, '1', 'EX', ttl);
    }
  }
}

export class PasswordService {
  salt = Number(process.env.AUTH_SALT);

  async hassPasword(passwordTxt: string) {
    return await bcrypt.hash(passwordTxt, this.salt);
  }

  async compareHashPassword(plainTxt: string, passwordHash: string) {
    return await bcrypt.compare(plainTxt, passwordHash);
  }
}
