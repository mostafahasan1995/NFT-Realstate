import { Injectable } from '@nestjs/common';
import { JwtService as NestJwtService } from '@nestjs/jwt';
import { AccessTokenPayload } from './interfaces/access-token-payload.interface';
import { ResetTokenPayload } from './interfaces/reset-token-payload.interface';
import { VerificationEmailTokenPayload } from './interfaces/verification-email-token-payload.interface';

@Injectable()
export class JwtService {
  private issuer = 'gamma-assets-api';

  constructor(private readonly nestJwtService: NestJwtService) { }

  generateAccessToken(payload: AccessTokenPayload): string {
    return this.nestJwtService.sign(
      {
        ...payload,
        type: 'access_token',
        issuer: this.issuer,
      },
      { expiresIn: '7d' }
    );
  }

  generateAccessTokenByTypeAndExpiresIn(payload, type: string, expiresIn: string): string {
    return this.nestJwtService.sign({
      ...payload,
      type: type,
      issuer: this.issuer,
    },
      { expiresIn: expiresIn }
    );
  }


  generateVerifyEmailToken(payload: VerificationEmailTokenPayload): string {
    return this.nestJwtService.sign(
      {
        ...payload,
        type: 'verify_email_token',
        issuer: this.issuer,
      },
      { expiresIn: '15m' }
    );
  }

  generateResetToken(payload: ResetTokenPayload): string {
    return this.nestJwtService.sign(
      {
        ...payload,
        type: 'reset_token',
        issuer: this.issuer,
      },
      { expiresIn: '1h' }
    );
  }

  verifyResetToken(token: string): ResetTokenPayload {
    const payload = this.nestJwtService.verify(token);

    if (payload.type !== 'reset_token') {
      throw new Error('Invalid token type');
    }

    return payload;
  }

  verifyVerificationEmailToken(token: string): VerificationEmailTokenPayload {
    const payload = this.nestJwtService.verify(token);

    if (payload.type !== 'verify_email_token') {
      throw new Error('Invalid token type');
    }

    return payload;
  }

  verifyToken(token: string, type: string) {
    const payload = this.nestJwtService.verify(token);
    if (payload.type !== type) {
      throw new Error('Invalid token type');
    }
    return payload;
  }
}
