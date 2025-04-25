import {Module} from '@nestjs/common';
import {ContractLogsService} from './contract-logs.service';
import {ContractLogsController} from './contract-logs.controller';
import {ContractLog} from './entities/contract-log.entity';
import {TypeOrmModule} from '@nestjs/typeorm';

@Module({
  imports: [TypeOrmModule.forFeature([ContractLog])],
  controllers: [ContractLogsController],
  providers: [ContractLogsService],
  exports: [ContractLogsService],
})
export class ContractLogsModule {}
