import {BadRequestException, Injectable} from '@nestjs/common';
import {randomBytes} from 'crypto';
import {totp} from 'otplib';
import {OtpRepository} from './otp.repository';
import {OtpActionType} from './types/otp-action-type.type';
import {EventEmitter2} from '@nestjs/event-emitter';
import {OtpEmailEvent} from '../aws/ses/events/otp-email.event';

// OTP is valid for 180 seconds (3 minutes)
totp.options = {step: 180};

@Injectable()
export class OtpService {
  constructor(
    private readonly otpRepository: OtpRepository,
    private readonly eventEmitter: EventEmitter2
  ) {}

  async generateUserOtp(
    email: string,
    otpActionType: OtpActionType
  ): Promise<void> {
    const secret = this.generateSecret();
    const otp = this.generateOtp(secret);

    // Create record into the database
    await this.otpRepository.create({
      email,
      secret,
      otpActionType: otpActionType,
    });

    // Emit send email to user with otp
    this.eventEmitter.emit('email.otp', new OtpEmailEvent(email, otp));
  }

  async verifyUserOtp(
    email: string,
    otp: string,
    otpActionType: OtpActionType
  ): Promise<void> {
    const secretDoc = await this.otpRepository.findLatestOtpForEmailAndType(
      email,
      otpActionType
    );
    if (!secretDoc?.secret) {
      throw new BadRequestException('OTP verification failed');
    }

    const isVerified = this.verifyOtp(secretDoc.secret, otp);
    if (!isVerified) {
      throw new BadRequestException('OTP verification failed');
    }
  }

  private generateSecret(): string {
    return randomBytes(20).toString('hex');
  }

  private generateOtp(secret: string): string {
    return totp.generate(secret);
  }

  private verifyOtp(secret: string, token: string): boolean {
    return totp.verify({
      secret,
      token,
    });
  }
}
