import { Injectable } from '@nestjs/common';
import {
  CreateTemplateCommand,
  SESClient,
  SendEmailCommand,
  SendRawEmailCommand,
  SendTemplatedEmailCommand,
} from '@aws-sdk/client-ses';
import { ContactUsEmailEvent } from './events/contact-us-email.event';
import { VerifyEmailEvent } from './events/verify-email.event';

@Injectable()
export class EmailSesService {
  private awsRegion = process.env.AWS_REGION;
  private awsSesSender = process.env.AWS_SES_SENDER;
  private sesClient = new SESClient({ region: this.awsRegion });

  async sendEmail(to: string, subject: string, text: string) {
    const params = {
      Source: this.awsSesSender,
      Destination: {
        ToAddresses: [to],
      },
      ReplyToAddresses: [],
      Message: {
        Html: {
          Charset: 'UTF-8',
          Data: '',
        },
        Body: {
          Text: {
            Charset: 'UTF-8',
            Data: text,
          },
        },
        Subject: {
          Charset: 'UTF-8',
          Data: subject,
        },
      },
    };

    try {
      const sendEmailCommand = new SendEmailCommand(params);
      const res = await this.sesClient.send(sendEmailCommand);
      return res;
    } catch (error) {
      console.error(error);
    }
  }

  async createTemplate(
    templateName: string,
    html: string,
    subject: string,
    text: string
  ) {
    const createTemplateCommand = new CreateTemplateCommand({
      // The template feature in Amazon SES is based on the Handlebars template system.
      Template: {
        // The name of an existing template in Amazon SES.
        TemplateName: templateName,
        HtmlPart: html,
        TextPart: text,
        SubjectPart: subject,
      },
    });

    try {
      const res = await this.sesClient.send(createTemplateCommand);
      return res;
    } catch (err) {
      console.error('Failed to create template.', err);
    }
  }

  async sendTemplatedEmail(
    to: string,
    templateName: string,
    templateData: any
  ) {
    const sendTemplatedEmailCommand = new SendTemplatedEmailCommand({
      /**
       * Here's an example of how a template would be replaced with user data:
       * Template: <h1>Hello {{contact.firstName}},</h1><p>Don't forget about the party gifts!</p>
       * Destination: <h1>Hello User,</h1><p>Don't forget about the party gifts!</p>
       */
      Destination: {
        ToAddresses: [to],
      },
      Source: this.awsSesSender,
      Template: templateName,
      TemplateData: JSON.stringify(templateData),
    });

    try {
      const res = await this.sesClient.send(sendTemplatedEmailCommand);
      return res;
    } catch (err) {
      console.error(err);
    }
  }

  async sendChargeWalletEmail(name: string, email: string): Promise<void> {
    const to = 'chargewallet@gammacities.com';
    const subject = `Request: Charge Wallet Request for ${email}`;
    const text = `Hi Team,\n\nCould you kindly assist the user with a smooth and efficient wallet charge process?\n\nUser Details:\nName: ${name}\nEmail: ${email}\n\nThank you for your prompt attention to this matter.\n\nBest,\nDev Team.`;

    // Send email
    await this.sendEmail(to, subject, text);
  }

  async sendOtpEmail(to: string, otp: string): Promise<void> {
    const subject = 'Your OTP';
    const text = `Your OTP is ${otp}`;

    // Send email
    await this.sendEmail(to, subject, text);
  }

  async sendContactUsEmail({
    name,
    email,
    phoneNumber,
    message,
  }: ContactUsEmailEvent): Promise<void> {
    const subject = 'Thank you for contacting us';
    const text = `Hi ${name},\n\nThank you for contacting us. Your message was: "${message}" and we will contact you at this number: ${phoneNumber}.\n\nWe will get back to you as soon as possible.\n\nBest,\nGamma Assets Team`;

    // Send email
    await this.sendEmail(email, subject, text);
  }

  async sendVerifyEmail({ name, email, code }: VerifyEmailEvent): Promise<void> {
    const subject = 'Verify your email';
    const text = `Hey ${name},\n\nThanks for signing up! 👋\n\nPlease verify your email address by using the below code:\n\n${code}\n\nIf you did not sign up to GammaCities, please ignore this email or contact us at support@gammacities.com\n\nThanks,\nThe GammaCities Team`;

    // Send email
    await this.sendEmail(email, subject, text);
  }

  async sendEmailWithAttachment(email: string, subject = 'report', fileBuffer: Buffer) {
    try {
      const TO_EMAIL = email
      let ses_mail = "From: " + this.awsSesSender + "\n";
      ses_mail += "To: " + TO_EMAIL + "\n";
      ses_mail += "Subject: " + subject + "\n";
      ses_mail += "MIME-Version: 1.0\n";
      ses_mail += "Content-Type: multipart/mixed; boundary=\"NextPart\"\n\n";
      ses_mail += "--NextPart\n";
      ses_mail += "Content-Type: text/html\n\n";
      ses_mail += "This is the body of the email.\n\n";
      ses_mail += "--NextPart\n";
      ses_mail += "Content-Type: application/octet-stream; name=\"report.xlsx\"\n";
      ses_mail += "Content-Transfer-Encoding: base64\n";
      ses_mail += "Content-Disposition: attachment\n\n";
      ses_mail += fileBuffer.toString("base64").replace(/([^\0]{76})/g, "$1\n") + "\n\n";
      ses_mail += "--NextPart--";

      const command = new SendRawEmailCommand({
        RawMessage: {
          Data: Buffer.from(ses_mail),
        },
        Source: this.awsSesSender,
        Destinations: [TO_EMAIL],
      });
      const response = await this.sesClient.send(command);
      return response;
    } catch (error) {
      console.error("Error sending email with attachment", error);
      throw error;
    }
  }
}
