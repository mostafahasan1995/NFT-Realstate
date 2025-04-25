import { Injectable } from '@nestjs/common';
import { ABIs } from 'apps/api/src/contracts/artifacts/abis.contract';
import { ethers } from 'ethers';
import { GusdContract } from '../artifacts/gusd/gusd';
import { EthersProviderService } from 'apps/api/src/ethers-provider/ethers-provider.service';
import { WalletsService } from 'apps/api/src/wallets/wallets.service';
import { ContractsService } from 'apps/api/src/contracts/contracts.service';
import { SmartContractException } from 'apps/api/src/contracts/exceptions/contract.exception';
import { TransferOwnershipDto } from '../dto/transfer-ownership.dto';
import { OWNER_WALLET_ADDRESS } from 'apps/api/src/contracts/constants/owner-wallet-address.const';

import { TokensService } from '../tokens.service';

@Injectable()
export class GUSDService {
  private readonly erc20Abi = ABIs.ERC20;
  private readonly gusdAbi = GusdContract.ABI;
  private readonly gusdBytecode = GusdContract.Bytecode;

  constructor(
    private readonly walletsService: WalletsService,
    private readonly tokensService: TokensService,

  ) { }


  async deployGusdContract(walletId: string) {
    try {
      const wallet = await this.walletsService.initializeManagedWalletById(
        walletId
      );

      const factory = new ethers.ContractFactory(
        this.gusdAbi,
        this.gusdBytecode,
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

  async transferGusdOwnership(
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
        this.gusdAbi,
        wallet
      );

      const gasLimit = await this.tokensService.estimateGasForTransaction(
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


}
