export class ContactUsEmailEvent {
  name: string;
  phoneNumber: string;
  email: string;
  message: string;

  constructor(
    name: string,
    phoneNumber: string,
    email: string,
    message: string
  ) {
    this.name = name;
    this.phoneNumber = phoneNumber;
    this.email = email;
    this.message = message;
  }
}
