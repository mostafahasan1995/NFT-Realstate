import {Module} from '@nestjs/common';
import {ContractsService} from './contracts.service';
import {ContractsController} from './contracts.controller';
import {Contract} from './entities/contract.entity';
import {ContractLogsModule} from '../contract-logs/contract-logs.module';
import {LogRetriever} from './log-retriever.service';
import {TypeOrmModule} from '@nestjs/typeorm';

@Module({
  imports: [TypeOrmModule.forFeature([Contract]), ContractLogsModule],
  controllers: [ContractsController],
  providers: [ContractsService, LogRetriever],
  exports: [ContractsService, LogRetriever],
})
export class ContractsModule {}
