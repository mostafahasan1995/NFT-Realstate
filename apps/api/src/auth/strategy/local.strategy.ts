import { Strategy } from 'passport-local';
import { PassportStrategy } from '@nestjs/passport';
import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthService } from '../auth.service';
import { User } from '../../users/schemas/user.schema';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private authService: AuthService) {
    super({ usernameField: 'email' });
  }

  async validate(email: string, password: string): Promise<User> {
    // Convert email to lowercase here
    const lowercaseEmail = email.toLowerCase();

    const user = await this.authService.validateUser(lowercaseEmail, password);
    if (!user) {
      throw new UnauthorizedException();
    }
    if (!user.isVerified) {
      throw new BadRequestException(
        'User not verified. Complete verification to proceed.'
      );
    }
    return user;
  }
}
