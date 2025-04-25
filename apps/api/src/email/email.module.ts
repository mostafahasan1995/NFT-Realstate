import { Module } from '@nestjs/common';
import { EmailService } from './email.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Email, EmailSchema } from './schemas/email.schema';
import { MailerModule } from '@nestjs-modules/mailer';
import { EmailSesModule } from '../aws/ses/email-ses.module';
import { EmailController } from './email.controller';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Email.name, schema: EmailSchema }]),
    EmailSesModule,
    MailerModule.forRoot({
      transport: {
        service: 'gmail',
        auth: {
          user: process.env.EMAIL,
          pass: process.env.PASSWORD,
        },
      },
      defaults: {
        from: process.env.EMAIL,
      },
    }),
  ],
  controllers: [EmailController],
  providers: [EmailService],
  exports: [EmailService],
})
export class EmailModule {}
