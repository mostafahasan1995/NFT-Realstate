import { BadRequestException, Injectable } from '@nestjs/common';
import { ethers } from 'ethers';
import { TokenVestingContract } from './artifacts/vesting-token.contract';
import { WalletsService } from 'apps/api/src/wallets/wallets.service';
import { SmartContractException } from 'apps/api/src/contracts/exceptions/contract.exception';

@Injectable()
export class TokenVestingService {
  private abi = TokenVestingContract.ABI
  private Bytecode = TokenVestingContract.Bytecode
  private readonly gmacVestingTokenAddress = ''
  constructor(private readonly walletsService: WalletsService) { }

  async deployContract(walletId: string) {
    try {
      const wallet = await this.walletsService.initializeManagedWalletById(
        walletId
      );

      const factory = new ethers.ContractFactory(
        this.abi,
        this.Bytecode,
        wallet
      );
      const contract = await factory.deploy({ gasLimit: 8_000_000 });

      await contract.getDeployedCode();
      const address = await contract.getAddress();

      return { address };
    } catch (error) {
      console.error(error);
      throw new SmartContractException(error);
    }
  }


  async setIcoParams(
    walletId: string, tokenAddress: string, quoteTokenAddress: string, price: number,
    vestingDuration: number, maxAmount: number, initialUnlockPercentage: number,
  ) {
    try {
      const wallet = await this.walletsService.initializeManagedWalletById(walletId)
      const contract = new ethers.Contract(tokenAddress, this.abi, wallet)

      if (maxAmount <= 0 || price <= 0 || vestingDuration <= 0 || initialUnlockPercentage < 0 || initialUnlockPercentage > 100) {
        throw new BadRequestException("Invalid parameter values");
      }


      const tx = await contract.setIcoParams(
        tokenAddress,
        quoteTokenAddress,
        (price * 10 ** 12),
        vestingDuration,
        maxAmount,
        initialUnlockPercentage
        , { gasLimit: 6_000_000 });
      await tx.wait();
      return { hash: tx.hash };
    } catch (error) {
      console.error(error);
      throw new SmartContractException(error);
    }
  }

  async icoBuy(walletId: string, amount: number) {

    try {
      const wallet = await this.walletsService.initializeManagedWalletById(walletId)
      const contract = new ethers.Contract(this.gmacVestingTokenAddress, this.abi, wallet)
      await contract.icoBuy(amount);
      return { message: '' }
    } catch (error) {
      console.error(error);
      throw new SmartContractException(error);
    }
  }

  async getIcoAvailable(walletId: string) {
    try {
      const wallet = await this.walletsService.initializeManagedWalletById(walletId)
      const contract = new ethers.Contract(this.gmacVestingTokenAddress, this.abi, wallet)
      await contract.icoAvailable();
      return { message: '' }
    } catch (error) {
      console.error(error);
      throw new SmartContractException(error);
    }
  }

  async getVestingSchedulesByAddressAndIndex(walletId: string, address: string, index: number) {
    try {
      const wallet = await this.walletsService.initializeManagedWalletById(walletId)
      const contract = new ethers.Contract(this.gmacVestingTokenAddress, this.abi, wallet)
      await contract.getVestingScheduleByAddressAndIndex(address, index);
      return { message: '' }
    } catch (error) {
      console.error(error);
      throw new SmartContractException(error);
    }
  }

  async createVestingSchedule(
    walletId: string,
    beneficiary: string,
    startAfter: number,
    cliff: number,
    duration: number,
    slicePeriodSeconds: number,
    sealed: boolean,
    amount: number,
  ) {

    try {
      const wallet = await this.walletsService.initializeManagedWalletById(walletId)
      const contract = new ethers.Contract(this.gmacVestingTokenAddress, this.abi, wallet)
      await contract.createVestingSchedule(
        beneficiary,
        startAfter,
        cliff,
        duration,
        slicePeriodSeconds,
        sealed,
        amount,
      );
      return { message: '' }
    } catch (error) {
      console.error(error);
      throw new SmartContractException(error);
    }
  }

  async mintAll(walletId: string) {
    try {
      const wallet = await this.walletsService.initializeManagedWalletById(walletId)
      const contract = new ethers.Contract(this.gmacVestingTokenAddress, this.abi, wallet)
      await contract.mintAll();
      return { message: '' }
    } catch (error) {
      console.error(error);
      throw new SmartContractException(error);
    }
  }

  async withdraw(walletId: string, tokenAddress: string, toAddress: string) {
    try {
      const wallet = await this.walletsService.initializeManagedWalletById(walletId)
      const contract = new ethers.Contract(this.gmacVestingTokenAddress, this.abi, wallet)
      await contract.withdraw(tokenAddress, toAddress);
      return { message: '' }
    } catch (error) {
      console.error(error);
      throw new SmartContractException(error);
    }
  }

}
