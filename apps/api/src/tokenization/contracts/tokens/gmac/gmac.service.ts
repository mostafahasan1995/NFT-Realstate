import { Injectable } from '@nestjs/common';
import { ABIs } from 'apps/api/src/contracts/artifacts/abis.contract';
import { ethers } from 'ethers';
import { GMACContract } from '../artifacts/gmac/gmac';
import { EthersProviderService } from 'apps/api/src/ethers-provider/ethers-provider.service';
import { WalletsService } from 'apps/api/src/wallets/wallets.service';
import { ContractsService } from 'apps/api/src/contracts/contracts.service';
import { TokenSymbol } from '../../../../model/types/token-symbol.type';
import { SmartContractException } from 'apps/api/src/contracts/exceptions/contract.exception';
import { MintTokensDto } from '../dto/mint-tokens.dto';
import { TransferDto } from '../dto/transfer.dto';
import { wait } from 'apps/api/src/common/utils/wait.util';
import { BalanceDto } from '../dto/balance.dto';
import { BurnTokensDto } from '../dto/burn-tokens.dto';
import { MinterRoleDto } from '../dto/minter-role.dto';
import { OWNER_WALLET_ADDRESS } from 'apps/api/src/contracts/constants/owner-wallet-address.const';
import { TransferOwnershipDto } from '../dto/transfer-ownership.dto';

@Injectable()
export class GMACService {
  private readonly erc20Abi = ABIs.ERC20;
  private readonly gmacAbi = GMACContract.ABI;
  private readonly gmacBytecode = GMACContract.Bytecode;

  constructor(
    private readonly ethersProviderService: EthersProviderService,
    private readonly walletsService: WalletsService,
    private readonly contractsService: ContractsService
  ) { }




  private async initializeContractByWalletId(
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

  async deployGmacContract(walletId: string) {
    try {
      const wallet = await this.walletsService.initializeManagedWalletById(
        walletId
      );

      const factory = new ethers.ContractFactory(
        this.gmacAbi,
        this.gmacBytecode,
        wallet
      );
      const contract = await factory.deploy({ gasLimit: 6_000_000 });

      await contract.getDeployedCode();
      const address = await contract.getAddress();

      return { address };
    } catch (error) {
      console.error(error);
      throw new SmartContractException(error);
    }
  }

  async transferGmacOwnership(
    walletId: string,
    { tokenContractAddress }: TransferOwnershipDto
  ) {
    // New owner address
    const newOwnerAddress = OWNER_WALLET_ADDRESS;

    try {
      const wallet = await this.walletsService.initializeManagedWalletById(
        walletId
      );
      const contract = new ethers.Contract(
        tokenContractAddress,
        this.gmacAbi,
        wallet
      );

      const gasLimit = await this.estimateGasForTransaction(
        walletId,
        'GUSD',
        'transferOwnership',
        newOwnerAddress
      );

      const tx = await contract.transferOwnership(newOwnerAddress, {
        gasLimit,
      });
      await tx.wait();

      return {
        hash: tx.hash,
      };
    } catch (error) {
      console.error(error);
      throw new SmartContractException(error);
    }
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

  private async estimateGasForTransaction(
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
