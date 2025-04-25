import { Injectable } from '@nestjs/common';
import { EmailSubscribersRepository } from './users.repository';

@Injectable()
export class EmailSubscribersService {
  constructor(readonly emailSubscribersRepository: EmailSubscribersRepository) { }
}
