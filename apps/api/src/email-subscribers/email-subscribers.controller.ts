import { Body, Controller, Post } from '@nestjs/common';
import { CreateSubscribersDto } from './dto/create-subscribers.dto';
import { EmailSubscribersService } from './email-subscribers.service';
import { Public } from '../auth/decorators/public.decorator';

@Public()
@Controller('email-subscribers')
export class EmailSubscribersController {
  constructor(private emailSubscribers: EmailSubscribersService) { }
  @Post()
  async createSubscriber(@Body() createSubscribers: CreateSubscribersDto) {
    try {
      return await this.emailSubscribers.emailSubscribersRepository.create(createSubscribers)
    } catch (e) {
      return { message: 'duplicate email' }
    }
  }
}
