import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { randomBytes, scrypt as _scrypt } from 'crypto';
import { promisify } from 'util';
const scrypt = promisify(_scrypt);

@Injectable()
export class AuthService {
  constructor(private usersService: UsersService) {}

  async signup(email: string, password: string) {
    // see if user with the email exists
    const users = await this.usersService.find(email);
    if (users.length) {
      throw new BadRequestException('Email in use');
    }
    // hash the password
    // Generate salt
    const salt = randomBytes(8).toString('hex');
    // Hash the password , salt
    const hash = (await scrypt(password, salt, 32)) as Buffer;
    // join the hashed result and salt together
    const result = salt + '.' + hash.toString('hex');
    // create a new user and save it to the database
    const user = await this.usersService.create(email, result);
    // return the user
    return user;
  }

  async signin(email: string, password: string) {
    const [user] = await this.usersService.find(email);
    if (!user) {
      throw new NotFoundException('Invalid credentials');
    }

    const [salt, storedHash] = user.password.split('.');
    const hash = (await scrypt(password, salt, 32)) as Buffer;

    if (storedHash !== hash.toString('hex')) {
      throw new BadRequestException('Invalid credentials');
    }
    return user;
  }
}
