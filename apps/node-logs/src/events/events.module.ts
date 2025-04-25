import {Module} from '@nestjs/common';
import {EventsService} from './events.service';
import {EventsGateway} from './events.gateway';
import {ContractsModule} from '../contracts/contracts.module';
import {ContractLogsModule} from '../contract-logs/contract-logs.module';

@Module({
  imports: [ContractsModule, ContractLogsModule],
  providers: [EventsGateway, EventsService],
})
export class EventsModule {}
