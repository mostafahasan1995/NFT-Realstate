import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import {JwtService} from './jwt.service';
import * as bcrypt from 'bcryptjs';
import {RegisterDto} from './dto/register.dto';
import {UsersService} from '../users/users.service';
import {GoogleAuthDto} from './dto/google-auth.dto';
import {EventEmitter2} from '@nestjs/event-emitter';
import {WelcomeEmailEvent} from '../aws/ses/events/welcome-email.event';
import {VerifyEmailEvent} from '../aws/ses/events/verify-email.event';
import {ResetPasswordEmailEvent} from '../aws/ses/events/reset-password-email.event';
import {User} from '../users/schemas/user.schema';
import {VerifyEmailDto} from './dto/verify-email.dto';
import {GoogleService} from './google.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly googleService: GoogleService,
    private readonly userService: UsersService,
    private readonly eventEmitter: EventEmitter2
  ) {}

  async register(registerDto: RegisterDto): Promise<{message: string}> {
    const user = await this.userService.create(registerDto);

    // Emit send welcome email event
    this.eventEmitter.emit(
      'email.welcome',
      new WelcomeEmailEvent(user.email, user.name)
    );

    // Emit send verify email event
    await this.sendVerificationEmail(user);

    return {message: 'User registered successfully.'};
  }

  login(user: User): {token: string} {
    const token = this.jwtService.generateAccessToken({
      sub: user._id,
      isVer: user.isVerified,
    });
    return {token};
  }

  async sendVerifyEmailRequest(email: string) {
    const message = 'Verification Email Request Received';
    // Find user by email
    const user = await this.userService.findOne({email});
    if (!user || user.isVerified) {
      return {message};
    }

    await this.sendVerificationEmail(user);

    return {message};
  }

  async verifyEmail({email, code}: VerifyEmailDto) {
    try {
      const user = await this.userService.findOne({
        email,
      });
      if (!user) {
        throw new Error('User not found');
      }
      if (user.isVerified) {
        throw new Error('User is already verified');
      }
      if (user.verificationCode !== code) {
        throw new Error('Invalid verification code');
      }
      // Verify user email
      await this.userService.verifyEmailById(user._id);

      const accessToken = this.jwtService.generateAccessToken({
        sub: user._id,
        isVer: true,
      });
      return {token: accessToken};
    } catch (error) {
      throw new UnauthorizedException('Verifying email failed');
    }
  }

  async initiatePasswordReset(email: string) {
    // Find user by email
    const user = await this.userService.findOne({email});
    if (!user) {
      return {message: 'Password Reset Request Received'};
    }

    // Generate reset token
    const resetToken = this.jwtService.generateResetToken({
      sub: user._id,
    });

    await this.userService.update(user._id, {resetToken});

    // send email with the reset token link
    const resetPasswordLink = `https://platform.gammaassets.com/auth/reset-password?token=${resetToken}`;

    // Emit send reset password link email event
    this.eventEmitter.emit(
      'email.resetPasswordLink',
      new ResetPasswordEmailEvent(user.email, user.name, resetPasswordLink)
    );

    return {message: 'Password Reset Request Received'};
  }

  async resetPassword(resetToken: string, newPassword: string) {
    try {
      const decoded = this.jwtService.verifyResetToken(resetToken);

      const user = await this.userService.findOne({
        _id: decoded.sub,
        resetToken,
      });
      if (!user) {
        throw new UnauthorizedException('Reset token has expired');
      }

      await this.userService.resetPassword(user._id, newPassword);

      return {message: 'Password reset successfully'};
    } catch (error) {
      throw new UnauthorizedException('Reset token has expired');
    }
  }

  async changePassword(
    userId: string,
    currentPassword: string,
    newPassword: string
  ) {
    const user = await this.userService.findOne({_id: userId});

    if (!user) {
      throw new BadRequestException('Invalid update request');
    }

    await this.userService.changePassword(
      user._id,
      currentPassword,
      newPassword
    );

    return {message: 'Password change successfully'};
  }

  async googleAuth({token, referrerCode, phoneNumber}: GoogleAuthDto) {
    try {
      const payload = await this.googleService.verifyGoogleAuth(token);
      const userId = payload['sub'];
      const name = payload['name'];
      const email = payload['email'];

      let user = await this.userService.findUserByThirdPartyProviderNameAndId(
        'google',
        userId
      );

      // If user doesn't exist based on Google ID, check based on email
      if (!user) {
        user = await this.userService.findOne({email});
        const thirdPartyProvider = {
          provider_name: 'google',
          provider_id: userId,
          provider_data: payload,
        };

        if (!user) {
          // Create a new user with the Google profile details
          const externalUserData = {
            name,
            username: name,
            email,
            phoneNumber,
            referrerCode: referrerCode,
            thirdPartyProviders: [thirdPartyProvider],
          };
          user = await this.userService.createWithThirdPartyProvider(
            externalUserData
          );
        } else {
          // Update existing user document with Google profile details
          user = await this.userService.updateThirdPartyProvider(
            user._id,
            thirdPartyProvider
          );
        }
      }

      const accessToken = this.jwtService.generateAccessToken({
        sub: user._id,
        isVer: user.isVerified,
      });
      return {token: accessToken};
    } catch (error) {
      console.error('Google authentication failed', error);
      throw new BadRequestException('Google authentication failed');
    }
  }

  async validateUser(email: string, pass: string): Promise<User> {
    const user = await this.userService.findOne({email});

    if (
      !user ||
      !user?.password ||
      !(await this.isPasswordValid(pass, user?.password))
    ) {
      throw new UnauthorizedException('Invalid email or password');
    }

    // Generate verification email token
    await this.sendVerificationEmail(user);

    return user;
  }

  async sendVerificationEmail(user: User) {
    if (user.isVerified) {
      return;
    }
    // Generate verification email code
    const verificationEmailCode = Number(
      Math.floor(100000 + Math.random() * 900000)
    ).toString();

    // Update user with verification email code
    await this.userService.update(user._id, {
      verificationCode: verificationEmailCode,
    });

    // Emit send verify email event
    this.eventEmitter.emit(
      'email.verify',
      new VerifyEmailEvent(user.email, user.name, verificationEmailCode)
    );
  }

  async validateUserById(id: string): Promise<User> {
    const user = await this.userService.findOne({_id: id});
    if (!user) {
      throw new UnauthorizedException();
    }

    return user;
  }

  private async isPasswordValid(
    password: string,
    hashedPassword: string
  ): Promise<boolean> {
    return await bcrypt.compare(password, hashedPassword);
  }
}
