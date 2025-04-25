import {
  Body,
  Controller,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { EmailSesService } from './email-ses.service';
import { Roles } from '../../auth/decorators/roles.decorator';
import { Role } from '../../auth/enums/role.enum';
import { RolesGuard } from '../../auth/guard/roles.guard';
import { FileInterceptor } from '@nestjs/platform-express';
import { uploadEmailOptions } from '../../file/multer.config';
import { SendBasicEmailDto } from './dto/send-basic-email.dto';
import { sendTemplatedEmailDto } from './dto/send-templated-email.dto';
import { ApiTags } from '@nestjs/swagger';

@Roles(Role.Admin)
@UseGuards(RolesGuard)
@ApiTags('admin/email-ses')
@Controller('admin/email-ses')
export class EmailSesAdminController {
  constructor(private readonly emailSesService: EmailSesService) { }

  @Post('send-basic-email')
  async sendBasicEmail(@Body() { text, to, subject }: SendBasicEmailDto) {
    try {
      const result = await this.emailSesService.sendEmail(to, subject, text);
      return { message: 'Email sent successfully', result };
    } catch (error) {
      return { error: 'Failed to send email' };
    }
  }

  @Post('create-template')
  @UseInterceptors(FileInterceptor('html', uploadEmailOptions))
  async createTemplate(
    @UploadedFile() html,
    @Body('templateName') templateName: string,
    @Body('subject') subject: string,
    @Body('text') text: string
  ) {
    try {
      const htmlContent = html ? html.buffer.toString() : '';
      const result = await this.emailSesService.createTemplate(
        templateName,
        htmlContent,
        subject,
        text
      );
      return { message: 'Template created successfully', result };
    } catch (error) {
      return { error: 'Failed to create template' };
    }
  }

  @Post('send-templated-email')
  async sendTemplatedEmail(
    @Body() { to, templateName, templateData }: sendTemplatedEmailDto
  ) {
    try {
      const result = await this.emailSesService.sendTemplatedEmail(
        to,
        templateName,
        templateData
      );
      return { message: 'Email with SES template sent successfully', result };
    } catch (error) {
      return { error: 'Failed to send email with SES template' };
    }
  }
}
