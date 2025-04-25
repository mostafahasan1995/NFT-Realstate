import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthService } from '../auth.service';
import { jwtConstants } from '../constants';
import { AccessTokenPayload } from '../interfaces/access-token-payload.interface';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly authService: AuthService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: jwtConstants.secret,
    });
  }

  async validate(payload: AccessTokenPayload) {
    if (payload.type === 'access_token') {
      return await this.authService.validateUserById(payload.sub);
    }
    throw new UnauthorizedException();
  }
}
