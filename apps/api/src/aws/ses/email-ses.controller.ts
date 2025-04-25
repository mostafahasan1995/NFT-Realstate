import {
  Body,
  Controller,
  Post,
  Get,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { EmailSesService } from './email-ses.service';
import { ApiTags } from '@nestjs/swagger';
import { Public } from '../../auth/decorators/public.decorator';
import { SendSubscriberEmailDto } from './dto/send-subscriber-email.dto';

@ApiTags('email-ses')
@Controller('email-ses')
export class EmailSesController {
  constructor(private readonly emailSesService: EmailSesService) {}

  @Public()
  @Post('send-subscriber-email')
  async sendSubscriberEmail(@Body() { email }: SendSubscriberEmailDto) {
    try {
      await this.emailSesService.sendEmail('', 'New subscriber', `this a new subscriber ${email}`);
      return { message: 'Email sent successfully' };
    } catch (error) {
      return { error: 'Failed to send email' };
    }
  }

  @Public()
  @Get('send-test-email')
  async sendTestEmail() {
    try {
      const email = 'aboez037@gmail.com';
      const result = await this.emailSesService.sendEmail(email, 'New subscriber', `This is a test email`);
      console.log(result);
      return { message: 'Test email sent successfully' };
    } catch (error) {
      return { error: 'Failed to send test email' };
    }
  }
}
