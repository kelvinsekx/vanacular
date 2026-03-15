import { Injectable } from '@nestjs/common';
import { type User, UsersService } from 'src/users/users.service';

@Injectable()
export class AuthService {
  constructor(private usersService: UsersService) {}

  async validateUser(
    username: string,
    pass: string,
  ): Promise<Omit<User, 'password'> | null> {
    const user = (await this.usersService.findOne(username)) as Omit<
      User,
      'password'
    > &
      Partial<Pick<User, 'password'>>;
    if (user && user.password === pass) {
      delete user.password;
      return user;
    }
    return null;
  }
}
