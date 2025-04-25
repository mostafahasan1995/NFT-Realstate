import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Email } from './schemas/email.schema';
import { Model } from 'mongoose';
import { MailerService } from '@nestjs-modules/mailer';
import { EmailAction } from './enums/email-action.enum';
import { VverseEmailConfig } from './constants/emails.config';

@Injectable()
export class EmailService {
  constructor(
    @InjectModel(Email.name)
    private readonly emailModel: Model<Email>,
    private readonly mailerService: MailerService
  ) {
    this.addTransporters();
  }

  private addTransporters() {
    this.mailerService.addTransporter(VverseEmailConfig.transporterName, {
      host: VverseEmailConfig.host,
      auth: {
        user: VverseEmailConfig.email,
        pass: VverseEmailConfig.password,
      },
    });
    // Add other transporters as needed
  }

  async sendEmailFromStreamUeVverse(
    filePaths: string[],
    name: string,
    villaNo: string,
    emails: string[]
  ) {
    const attachments = filePaths.map((filePath) => ({ path: filePath }));

    await this.mailerService.sendMail({
      transporterName: VverseEmailConfig.transporterName,
      to: emails,
      subject: 'Your Recent Invoice',
      text: `Dear ${name},\n\nThank you for choosing your new finishings for your villa ${villaNo} at Reem Hills.\n\nYour selected finishes are detailed in the attached invoice.\n\nThe invoice is due for payment, and once paid we will confirm the same and apply the new finishes to your villa during construction.\n\nShould you need any further clarification, please do not hesitate to contact us.\n
      `,
      attachments: attachments,
      from: VverseEmailConfig.email,
    });

    // Save email to db
    for (const email of emails) {
      await this.emailModel.create({
        emailAction: EmailAction.UnrealEngine,
        from: VverseEmailConfig.email,
        to: email,
      });
    }
  }

  async sendEmailFromStreamUeGammacities(
    filePaths: string[],
    name: string,
    emails: string[]
  ) {
    const attachments = filePaths.map((filePath) => ({ path: filePath }));

    await this.mailerService.sendMail({
      to: emails,
      subject: 'Your Recent Invoice',
      text: `Dear ${name},\n\nThank you for choosing your new finishings for your villa at GammaCities.\n\nYour selected finishes are detailed in the attached invoice.\n\nThe invoice is due for payment, and once paid we will confirm the same and apply the new finishes to your villa during construction.\n\nShould you need any further clarification, please do not hesitate to contact us.\n
      `,
      attachments: attachments,
    });

    // Save email to db
    for (const email of emails) {
      await this.emailModel.create({
        emailAction: EmailAction.UnrealEngine,
        from: process.env.EMAIL,
        to: email,
      });
    }
  }

  async findAllChargeWalletRequests() {
    return await this.emailModel.find({
      emailAction: EmailAction.ChargeWallet,
    });
  }
}
