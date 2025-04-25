import Strategy from 'passport-headerapikey';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';

@Injectable()
export class ApiKeyStrategy extends PassportStrategy(Strategy, 'api-key') {
  constructor() {
    super({ header: 'x-api-key', prefix: '' }, true, async (apiKey, done) => {
      if (apiKey === process.env.API_KEY) {
        return done(null, true);
      }
      return done(new UnauthorizedException('Invalid API key'), false);
    });
  }
}
