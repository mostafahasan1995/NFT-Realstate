import {Injectable} from '@nestjs/common';
import {ContractLog} from './entities/contract-log.entity';
import {InjectRepository} from '@nestjs/typeorm';
import {Repository} from 'typeorm';

@Injectable()
export class ContractLogsService {
  constructor(
    @InjectRepository(ContractLog)
    private readonly contractLogsRepository: Repository<ContractLog>
  ) {}

  async findAll(filter?: Partial<ContractLog>): Promise<ContractLog[]> {
    return await this.contractLogsRepository.find({where: filter});
  }

  async findOne(id: number): Promise<ContractLog> {
    return await this.contractLogsRepository.findOneBy({id});
  }

  async create(createEventDto: Partial<ContractLog>): Promise<ContractLog> {
    return await this.contractLogsRepository.save(createEventDto);
  }

  async update(
    id: number,
    updateEventDto: Partial<ContractLog>
  ): Promise<ContractLog> {
    await this.contractLogsRepository.update(id, updateEventDto);
    return this.findOne(id);
  }

  async isExistsByTxHash(txHash: string): Promise<boolean> {
    const event = await this.contractLogsRepository.findOne({where: {txHash}});
    return !!event;
  }

  async checkOrCreateEventByTxHash(
    createEventDto: Partial<ContractLog>
  ): Promise<ContractLog> {
    let event = await this.contractLogsRepository.findOne({
      where: {txHash: createEventDto.txHash},
    });

    if (!event) {
      event = await this.create(createEventDto);
    }

    return event;
  }
}
