import {Injectable} from '@nestjs/common';
import {Contract} from './entities/contract.entity';
import {InjectRepository} from '@nestjs/typeorm';
import {Repository} from 'typeorm';

@Injectable()
export class ContractsService {
  constructor(
    @InjectRepository(Contract)
    private readonly contractRepository: Repository<Contract>
  ) {}

  async findAll(): Promise<Contract[]> {
    return await this.contractRepository.find();
  }

  async findById(id: number): Promise<Contract> {
    return await this.contractRepository.findOneBy({id});
  }

  async create(createContractDto: Partial<Contract>): Promise<Contract> {
    return await this.contractRepository.save(createContractDto);
  }

  async update(
    id: number,
    updateContractDto: Partial<Contract>
  ): Promise<Contract> {
    await this.contractRepository.update(id, updateContractDto);
    return this.findById(id);
  }

  async checkOrCreateContractByAddress(
    createContractDto: Partial<Contract>
  ): Promise<Contract> {
    let contract = await this.contractRepository.findOne({
      where: {contractAddress: createContractDto.contractAddress},
    });

    if (!contract) {
      contract = await this.create(createContractDto);
      console.log('New contract added:', contract);
      return contract;
    }

    console.log('Contract already exists:', contract);
    return contract;
  }
}
