import { Injectable } from '@nestjs/common';
import { SmartContractException } from '../../../contracts/exceptions/contract.exception';
import { ethers } from 'ethers';
import { SimpleSwapContract } from './artifacts/simple-swap.contract';
import { WalletsService } from '../../../wallets/wallets.service';
import { DeployContractDto } from './dto/deploy-contract.dto';
import { SetPriceDto } from './dto/set-price.dto';
import { GetPriceDto } from './dto/get-price.dto';
import { ContractsService } from '../../../contracts/contracts.service';

@Injectable()
export class SimpleSwapService {
  private readonly simpleSwapAbi = SimpleSwapContract.ABI;
  private readonly simpleSwapByteCode = SimpleSwapContract.Bytecode;
  private gusdAddress;

  constructor(
    private readonly walletsService: WalletsService,
    private readonly contractsService: ContractsService
  ) {
    this.gusdAddress =
      this.contractsService.getTokenBySymbol('GUSD').tokenAddress;
  }

  async deployContract(walletId: string, { tokenAddress }: DeployContractDto) {
    // initialize managed wallet
    const wallet = await this.walletsService.initializeManagedWalletById(
      walletId
    );

    try {
      const abi = this.simpleSwapAbi;
      const bytecode = this.simpleSwapByteCode;
      const factory = new ethers.ContractFactory(abi, bytecode, wallet);
      const contract = await factory.deploy(this.gusdAddress, tokenAddress, {
        gasLimit: 6_000_000,
      });
      await contract.getDeployedCode();
      const address = await contract.getAddress();

      return address;
    } catch (error) {
      console.error(error);
      throw new SmartContractException(error);
    }
  }

  async setPrice(walletId: string, { poolAddress, price }: SetPriceDto) {
    // initialize managed wallet
    const wallet = await this.walletsService.initializeManagedWalletById(
      walletId
    );

    try {
      const abi = this.simpleSwapAbi;
      const contract = new ethers.Contract(poolAddress, abi, wallet);
      const transaction = await contract.setPrice(
        BigInt(ethers.parseEther(price.toString())),
        {
          gasLimit: 6_000_000,
        }
      );
      const recept = await transaction.wait();

      return recept.hash;
    } catch (error) {
      console.error(error);
      throw new SmartContractException(error);
    }
  }

  async getPrice(walletId: string, { poolAddress }: GetPriceDto) {
    // initialize managed wallet
    const wallet = await this.walletsService.initializeManagedWalletById(
      walletId
    );

    try {
      const abi = this.simpleSwapAbi;
      const contract = new ethers.Contract(poolAddress, abi, wallet);
      const price = await contract.price();

      return Number(ethers.formatEther(price));
    } catch (error) {
      console.error(error);
      throw new SmartContractException(error);
    }
  }
}
