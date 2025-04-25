export class ResetPasswordEmailEvent {
  email: string;
  name: string;
  resetPasswordLink: string;

  constructor(email: string, name: string, resetPasswordLink: string) {
    this.email = email;
    this.name = name;
    this.resetPasswordLink = resetPasswordLink;
  }
}
