import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { APP_GUARD } from '@nestjs/core';
import { JwtService } from './jwt.service';
import { JwtAuthGuard } from './guard/jwt-auth.guard';
import { UsersModule } from '../users/users.module';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { LocalStrategy } from './strategy/local.strategy';
import { JwtStrategy } from './strategy/jwt.strategy';
import { ApiKeyStrategy } from './strategy/api-key.strategy';
import { jwtConstants } from './constants';
import { AdminAuthController } from './auth.admin.controller';
import { GoogleService } from './google.service';

@Module({
  imports: [
    UsersModule,
    PassportModule,
    JwtModule.register({
      secret: jwtConstants.secret,
    }),
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    AuthService,
    JwtService,
    LocalStrategy,
    JwtStrategy,
    GoogleService,
    ApiKeyStrategy,

  ],
  controllers: [AuthController, AdminAuthController],
  exports: [AuthService, PassportModule, JwtStrategy, ApiKeyStrategy, JwtService],
})
export class AuthModule { }
