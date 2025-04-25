import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ethers } from 'ethers';

import { IncomeDistributorContract } from './artifacts/income-distributor.contract';
import { WalletsService } from '../../../wallets/wallets.service';
import { DeployDto } from './dto/deploy.dto';
import { TokenizationIncomeDistributor } from './schemas/income-distributor.schema';

@Injectable()
export class AssetIncomeDistributorService {
  private readonly incomeDistributorAbi = IncomeDistributorContract.ABI;
  private readonly incomeDistributorByteCode =
    IncomeDistributorContract.BYTECODE;

  constructor(
    @InjectModel(TokenizationIncomeDistributor.name)
    private readonly TokenizationIncomeDistributorModel: Model<TokenizationIncomeDistributor>,
    private readonly walletsService: WalletsService
  ) {}

  async findAllIncomeDistributor() {
    return await this.TokenizationIncomeDistributorModel.find();
  }

  async findOneByFractionsAddress(fractionsAddress: string) {
    return await this.TokenizationIncomeDistributorModel.findOne({
      fractionsAddress,
    });
  }

  async deployContract(walletId: string, deployDto: DeployDto) {
    const { fractionsTokenAddress, orderBookAddress, distributorAddress } =
      deployDto;
    // initialize managed wallet
    const wallet = await this.walletsService.initializeManagedWalletById(
      walletId
    );

    const abi = this.incomeDistributorAbi;
    const bytecode = this.incomeDistributorByteCode;
    const factory = new ethers.ContractFactory(abi, bytecode, wallet);
    const contract = await factory.deploy(
      fractionsTokenAddress,
      distributorAddress,
      orderBookAddress,
      { gasLimit: 6_000_000 }
    );
    await contract.getDeployedCode();
    const address = await contract.getAddress();

    // Save to database
    const incomeDistributor =
      await this.TokenizationIncomeDistributorModel.create({
        incomeDistributorAddress: address,
        distributorAddress,
        orderBookAddress,
      });
    return incomeDistributor;
  }
}
