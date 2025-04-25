import { Controller, Post, Body, UseInterceptors } from '@nestjs/common';
import { FormsService } from './forms.service';
import { FormGalaEventDto } from './dto/form-gala-event.dto';
import { Public } from '../auth/decorators/public.decorator';
import { FormContactUsDto } from './dto/form-contact-us.dto';
import { FormFundingDto } from './dto/form-funding.dto';

@Public()
@Controller('forms')
export class FormsController {
  constructor(private readonly formsService: FormsService) { }

  @Post('submit-event-gala-form')
  async saveFormGalaEvent(@Body() formGalaEventDto: FormGalaEventDto) {
    return await this.formsService.saveFormGalaEvent(formGalaEventDto);
  }

  @Post('submit-contact-us')
  async saveContactUs(@Body() formContactUsDto: FormContactUsDto) {
    return await this.formsService.saveContactUs(formContactUsDto);
  }

  @Post('submit-requester-info')
  async saveRequesterInfo(@Body() formContactUsDto: FormContactUsDto) {
    return await this.formsService.saveRequesterInfo(formContactUsDto);
  }

  @Post('submit-funding-request')
  async saveFundingRequest(@Body() formFundingDto: FormFundingDto) {
    return await this.formsService.saveFundingRequest(formFundingDto);
  }
}
