import { BadRequestException, HttpCode, HttpException, Injectable } from '@nestjs/common';
import { FormGalaEventDto } from './dto/form-gala-event.dto';
import { FormRepository } from './forms.repository';
import { FormContactUsDto } from './dto/form-contact-us.dto';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { ContactUsEmailEvent } from '../aws/ses/events/contact-us-email.event';
import { FormFundingDto } from './dto/form-funding.dto';
import { FundingRequestsRepository } from './forms.funding-request';
import { JwtService } from '../auth/jwt.service';
import { FormType } from './enum/form-type.enum';
import { HttpStatusCode } from 'axios';

@Injectable()
export class FormsService {
  constructor(
    private readonly formRepository: FormRepository,
    private readonly eventEmitter: EventEmitter2,
    private readonly fundingRequestsRepository: FundingRequestsRepository,
    private readonly jwtService: JwtService
  ) { }

  async findAll(formType: FormType) {
    if (formType === FormType.fundingRequest)
      return await this.fundingRequestsRepository.model.find()
    return await this.formRepository.find({ formType: formType });
  }

  async saveFormGalaEvent(formGalaEventDto: FormGalaEventDto) {
    return await this.formRepository.create({
      ...formGalaEventDto,
      numberOfAttendees: formGalaEventDto.NumberOfAttendees,
      formType: 'event-gala',
    });
  }

  async saveContactUs(formContactUsDto: FormContactUsDto) {
    // Emit send email to noreply email
    const { name, phoneNumber, email, message } = formContactUsDto;
    this.eventEmitter.emit(
      'email.contactUs',
      new ContactUsEmailEvent(name, phoneNumber, email, message)
    );

    return await this.formRepository.create({
      ...formContactUsDto,
      formType: 'contact-us',
    });
  }

  async saveRequesterInfo(formContactUsDto: FormContactUsDto) {
    const data = await this.formRepository.create({
      ...formContactUsDto,
      formType: 'funding-request',
    });
    const token = this.jwtService.generateAccessTokenByTypeAndExpiresIn({ id: data._id }, 'funding-request-token', '30m')
    return { data, token }
  }


  async saveFundingRequest(formFundingDto: FormFundingDto) {
    try {
      const payload = this.jwtService.verifyToken(formFundingDto.token, 'funding-request-token')
      if (!payload || payload.id !== formFundingDto.contactId) {
        throw new BadRequestException('Invalid token')
      }
      return await this.fundingRequestsRepository.create(formFundingDto);
    } catch (e) {
      throw new HttpException(e.message, e.status ?? HttpStatusCode.BadRequest)
    }
  }
}
