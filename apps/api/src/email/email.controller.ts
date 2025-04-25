import {
  BadRequestException,
  Body,
  Controller,
  Post,
  UseGuards,
} from '@nestjs/common';
import { RolesGuard } from '../auth/guard/roles.guard';
import { Public } from '../auth/decorators/public.decorator';
import { ApiKeyGuard } from '../auth/guard/api-key-auth.guard';
import { SendEmailVverseDto } from './dto/send-email-vverse';
import { EmailService } from './email.service';
import { ApiTags } from '@nestjs/swagger';
import { SendEmailGammaDto } from './dto/send-email-gamma.dto';

@UseGuards(RolesGuard)
@ApiTags('emails')
@Controller('emails')
export class EmailController {
  constructor(private readonly emailService: EmailService) {}

  // Send email to client from Stream UE
  @Public()
  @UseGuards(ApiKeyGuard)
  @Post('stream-ue/clients/vverse')
  async sendEmailFromStreamUeVverse(
    @Body()
    {
      name,
      villaNo,
      clientEmail,
      salesmanEmail,
      pdfFileUrl,
      excelFileUrl,
    }: SendEmailVverseDto
  ) {
    const emails = [clientEmail, salesmanEmail].filter((email) => !!email);
    const files = [pdfFileUrl, excelFileUrl];
    try {
      // Send email to client
      await this.emailService.sendEmailFromStreamUeVverse(
        files,
        name,
        villaNo,
        emails
      );

      return {
        message: 'Ok',
      };
    } catch (error) {
      console.error(error);
      throw new BadRequestException('Error sending email');
    }
  }

  // Send email to client from Stream UE
  @Public()
  @UseGuards(ApiKeyGuard)
  @Post('stream-ue/clients/gammacities')
  async sendEmailFromStreamUeGammacities(
    @Body()
    {
      name,
      clientEmail,
      salesmanEmail,
      pdfFileUrl,
      excelFileUrl,
    }: SendEmailGammaDto
  ) {
    const emails = [clientEmail, salesmanEmail].filter((email) => !!email);
    const files = [pdfFileUrl, excelFileUrl];
    try {
      // Send email to client
      await this.emailService.sendEmailFromStreamUeGammacities(
        files,
        name,
        emails
      );

      return {
        message: 'Ok',
      };
    } catch (error) {
      console.error(error);
      throw new BadRequestException('Error sending email');
    }
  }
}
