export class VerifyEmailEvent {
  email: string;
  name: string;
  code: string;

  constructor(email: string, name: string, code: string) {
    this.email = email;
    this.name = name;
    this.code = code;
  }
}
