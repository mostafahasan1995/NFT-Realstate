export class OtpEmailEvent {
  to: string;
  otp: string;

  constructor(to: string, otp: string) {
    this.to = to;
    this.otp = otp;
  }
}
