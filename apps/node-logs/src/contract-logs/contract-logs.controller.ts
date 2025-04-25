import {Controller, Get} from '@nestjs/common';
import {ContractLogsService} from './contract-logs.service';

@Controller('contract-logs')
export class ContractLogsController {
  constructor(private readonly contractLogsService: ContractLogsService) {}

  @Get()
  async getAllEvents() {
    return await this.contractLogsService.findAll();
  }
}
