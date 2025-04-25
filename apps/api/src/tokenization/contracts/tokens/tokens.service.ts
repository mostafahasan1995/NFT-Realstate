import { HttpException, Injectable } from '@nestjs/common';
import { ethers } from 'ethers';
import { EthersProviderService } from '../../../ethers-provider/ethers-provider.service';
import { WalletsService } from '../../../wallets/wallets.service';
import { TransferDto } from './dto/transfer.dto';
import { SmartContractException } from '../../../contracts/exceptions/contract.exception';
import { MinterRoleDto } from './dto/minter-role.dto';
import { MintTokensDto } from './dto/mint-tokens.dto';
import { BurnTokensDto } from './dto/burn-tokens.dto';
import { BalanceDto } from './dto/balance.dto';
import { ContractsService } from '../../../contracts/contracts.service';
import { wait } from '../../../common/utils/wait.util';
import { TokenSymbol } from 'apps/api/src/model/types/token-symbol.type';
import { HttpStatusCode } from 'axios';
import { TransferTokensByAddressDto } from './dto/transfer-tokens-from-to-user.dto';

@Injectable()
export class TokensService {

  constructor(
    private readonly ethersProviderService: EthersProviderService,
    private readonly walletsService: WalletsService,
    private readonly contractsService: ContractsService
  ) { }


  async initializeContractByWalletId(
    walletId: string,
    tokenSymbol: TokenSymbol
  ) {
    const tokenContract = this.contractsService.getTokenContract(tokenSymbol);

    const wallet = await this.walletsService.initializeManagedWalletById(
      walletId
    );
    const contract = new ethers.Contract(
      tokenContract.address,
      tokenContract.abi,
      wallet
    );
    return contract;
  }


  async grantMinterRole(
    walletId: string,
    tokenSymbol: TokenSymbol,
    { walletAddress }: MinterRoleDto
  ) {
    try {
      const contract = await this.initializeContractByWalletId(
        walletId,
        tokenSymbol
      );

      const gasLimit = await this.estimateGasForTransaction(
        walletId,
        tokenSymbol,
        'grantMinterRole',
        walletAddress
      );

      const tx = await contract.grantMinterRole(walletAddress, {
        gasLimit,
      });
      const receipt = await tx.wait();

      return receipt;
    } catch (error) {
      console.error(error);
      throw new SmartContractException(error);
    }
  }

  async revokeMinterRole(
    walletId: string,
    tokenSymbol: TokenSymbol,
    { walletAddress }: MinterRoleDto
  ) {
    try {
      const contract = await this.initializeContractByWalletId(
        walletId,
        tokenSymbol
      );

      const gasLimit = await this.estimateGasForTransaction(
        walletId,
        tokenSymbol,
        'revokeMinterRole',
        walletAddress
      );

      const tx = await contract.revokeMinterRole(walletAddress, {
        gasLimit,
      });
      const receipt = await tx.wait();

      return receipt;
    } catch (error) {
      console.error(error);
      throw new SmartContractException(error);
    }
  }

  async mintTokens(
    walletId: string,
    tokenSymbol: TokenSymbol,
    { walletAddress, amount }: MintTokensDto
  ) {
    try {
      const contract = await this.initializeContractByWalletId(
        walletId,
        tokenSymbol
      );
      const amountToMint = BigInt(ethers.parseEther(`${amount}`));

      const gasLimit = await this.estimateGasForTransaction(
        walletId,
        tokenSymbol,
        'mint',
        walletAddress,
        amountToMint
      );

      const tx = await contract.mint(walletAddress, amountToMint, {
        gasLimit,
      });
      const receipt = await tx.wait();

      return receipt;
    } catch (error) {
      console.error(error);
      throw new SmartContractException(error);
    }
  }

  async burnTokens(
    walletId: string,
    tokenSymbol: TokenSymbol,
    { amount }: BurnTokensDto
  ) {
    try {
      const contract = await this.initializeContractByWalletId(
        walletId,
        tokenSymbol
      );

      const amountToBurn = BigInt(ethers.parseEther(`${amount}`));

      const gasLimit = await this.estimateGasForTransaction(
        walletId,
        tokenSymbol,
        'burn',
        amountToBurn
      );

      const tx = await contract.burn(amountToBurn, {
        gasLimit,
      });
      const receipt = await tx.wait();

      return receipt;
    } catch (error) {
      console.error(error);
      throw new SmartContractException(error);
    }
  }

  async getBalance(tokenSymbol: TokenSymbol, { walletAddress }: BalanceDto) {
    try {
      const tokenContract = this.contractsService.getTokenContract(tokenSymbol);

      const contract = new ethers.Contract(
        tokenContract.address,
        tokenContract.abi,
        this.ethersProviderService.getProvider()
      );
      const balance = Number(
        ethers.formatEther(await contract.balanceOf(walletAddress))
      );

      return balance;
    } catch (error) {
      console.error(error);
      throw new SmartContractException(error);
    }
  }

  async getSupplyCap(tokenSymbol: TokenSymbol) {
    const tokenContract = this.contractsService.getTokenContract(tokenSymbol);

    const contract = new ethers.Contract(
      tokenContract.address,
      tokenContract.abi,
      this.ethersProviderService.getProvider()
    );
    const supplyCap = Number(ethers.formatEther(await contract.totalSupply()));

    return supplyCap;
  }

  async transferFromToUser(tokenSymbol: TokenSymbol, { recipientAddress, amount, senderAddress }: TransferTokensByAddressDto) {
    const senderWallet = await this.walletsService.findOne({ address: senderAddress })
    if (!senderWallet)
      throw new HttpException('Wallet not found', HttpStatusCode.BadRequest)
    const result = await this.transfer(senderWallet._id, tokenSymbol, { recipientAddress, amount })
    return result
  }


  async transfer(
    walletId,
    tokenSymbol: TokenSymbol,
    { recipientAddress, amount }: TransferDto
  ) {
    try {
      const contract = await this.initializeContractByWalletId(
        walletId,
        tokenSymbol
      );

      const amountWei = ethers.parseEther(amount.toString());

      const gasLimit = await this.estimateGasForTransaction(
        walletId,
        tokenSymbol,
        'transfer',
        recipientAddress,
        amountWei
      );

      const tx = await contract.transfer(recipientAddress, amountWei, {
        gasLimit,
      });
      await tx.wait();

      return tx.hash;
    } catch (error) {
      console.error('Error transferring:', error.message);
      throw new SmartContractException(error);
    }
  }

  async transferEth(transferDto: TransferDto) {
    try {
      const wallet = this.walletsService.initializeLocalWallet();

      const amountToSend = BigInt(ethers.parseEther(`${transferDto.amount}`));
      await wallet.sendTransaction({
        to: transferDto.recipientAddress,
        value: amountToSend,
      });

      return { success: true };
    } catch (error) {
      console.error('Error transferring:', error.message);
    }
  }

  async estimateGasForTransaction(
    walletId: string,
    tokenSymbol: TokenSymbol,
    methodName: string,
    ...args
  ): Promise<bigint> {
    await wait(10);
    try {
      const contract = await this.initializeContractByWalletId(
        walletId,
        tokenSymbol
      );

      const estimatedGas = await contract[methodName].estimateGas(...args);

      const gasPrice = BigInt(await this.ethersProviderService.getGasPrice());

      // Add a safety margin
      const gasLimit = (estimatedGas * gasPrice * BigInt(120)) / BigInt(100);

      console.log(`Estimated gas for ${methodName}:`, gasLimit.toString());

      return gasLimit;
    } catch (error) {
      console.error('Transaction gas estimation error:', error);
    }
  }
}
