import { Module } from '@nestjs/common';
import { EmailSubscribersService } from './email-subscribers.service';
import { EmailSubscribersController } from './email-subscribers.controller';
import { EmailSubscribers, EmailSubscribersSchema } from './schema/email-subscribers.dto';
import { MongooseModule } from '@nestjs/mongoose';
import { EmailSubscribersRepository } from './users.repository';

@Module({
  imports: [MongooseModule.forFeature([{ name: EmailSubscribers.name, schema: EmailSubscribersSchema }]),],
  providers: [EmailSubscribersService, EmailSubscribersRepository],
  controllers: [EmailSubscribersController],
  exports:[EmailSubscribersService]
})
export class EmailSubscribersModule { }
