import { HttpException, Injectable } from '@nestjs/common';
import { ethers } from 'ethers';
import { AssetFractionsTokenContract } from './artifacts/asset-fractions-token.contract';
import { WalletsService } from '../../../wallets/wallets.service';
import { DeployAssetFractionsTokenDto } from './dto/deploy-asset-fractions-token.dto';
import { InitDto } from './dto/init.dto';
import { BalanceOfDto } from './dto/balanceOf.dto';
import { EthersProviderService } from '../../../ethers-provider/ethers-provider.service';
import { SmartContractException } from '../../../contracts/exceptions/contract.exception';
import { formatNumberToTwoDecimals } from '../../../common/utils/format-number-to-decimal.util';
import { SetOrderBookAddressDto } from './dto/set-order-book-address.dto';
import { TransferOwnershipDto } from './dto/transfer-ownership.dto';
import { OWNER_WALLET_ADDRESS } from '../../../contracts/constants/owner-wallet-address.const';
import { TransferTokensDto } from './dto/transfet-tokens';
import { ABIs } from '../../../contracts/artifacts/abis.contract';
import { HttpStatusCode } from 'axios';
import { AssetService } from 'apps/api/src/asset/asset.service';
import { TransferTokensByAddressDto } from './dto/transfet-tokens-by-user-email';
import { BurnTokensDto } from './dto/burn-tokens.dto';

@Injectable()
export class AssetFractionsTokenService {
  private readonly erc20Abi = ABIs.ERC20;
  private readonly assetFractionsTokenAbi = AssetFractionsTokenContract.ABI;
  private readonly assetFractionsTokenBytecode = AssetFractionsTokenContract.Bytecode;

  constructor(
    private readonly walletsService: WalletsService,
    private readonly ethersProviderService: EthersProviderService,
    private readonly assetService: AssetService
  ) { }

  async deploy(walletId: string, { name, symbol }: DeployAssetFractionsTokenDto): Promise<string> {
    // initialize managed wallet
    const wallet = await this.walletsService.initializeManagedWalletById(walletId);

    try {
      const abi = this.assetFractionsTokenAbi;
      const bytecode = this.assetFractionsTokenBytecode;
      const factory = new ethers.ContractFactory(abi, bytecode, wallet);
      const contract = await factory.deploy(name, symbol, {
        gasLimit: 8_000_000,
      });
      await contract.getDeployedCode();
      const contractAddress = await contract.getAddress();

      return contractAddress;
    } catch (error) {
      console.error(error);
      throw new SmartContractException(error);
    }
  }

  async init(walletId: string, initDto: InitDto) {
    const { assetFractionsTokenAddress, nftCollectionAddress, tokenId, supplyCap, minter } = initDto;

    try {
      const contract = await this.initializeContractByWalletId(walletId, assetFractionsTokenAddress);

      const gasLimit = await this.walletsService.estimateGasForTransaction(walletId, assetFractionsTokenAddress, 'init', this.assetFractionsTokenAbi, BigInt(supplyCap), minter, nftCollectionAddress, tokenId);

      const tx = await contract.init(BigInt(supplyCap), minter, nftCollectionAddress, tokenId, {
        gasLimit: gasLimit,
      });
      const receipt = await tx.wait();

      // Transfer ownership
      await this.transferOwnership(walletId, {
        assetFractionsTokenAddress,
      });

      return receipt;
    } catch (error) {
      console.error(error);
      throw new SmartContractException(error);
    }
  }

  async setOrderBookAddress(walletId: string, { fractionAddress, orderBookAddress }: SetOrderBookAddressDto) {
    try {
      const contract = await this.initializeContractByWalletId(walletId, fractionAddress);

      const gasLimit = await this.walletsService.estimateGasForTransaction(walletId, fractionAddress, 'setOrderBookAddress', this.assetFractionsTokenAbi, orderBookAddress);

      const tx = await contract.setOrderBookAddress(orderBookAddress, {
        gasLimit: gasLimit,
      });
      const receipt = await tx.wait();

      return receipt;
    } catch (error) {
      console.error(error);
      throw new SmartContractException(error);
    }
  }

  async balanceOf({ fractionAddress, walletAddress }: BalanceOfDto) {
    try {
      const contract = this.initializeContractByLocalWallet(fractionAddress);
      const balance = Number(await contract.balanceOf(walletAddress));

      return formatNumberToTwoDecimals(balance);
    } catch (error) {
      console.error(error);
      throw new SmartContractException(error);
    }
  }

  async getSummaryFraction(contractAddress: string) {
    try {
      const abi = this.assetFractionsTokenAbi;
      const contract = new ethers.Contract(contractAddress, abi, this.ethersProviderService.getProvider());
      const maxSupply = Number(await contract.maxSupply());
      const totalSupply = Number(await contract.totalSupply());

      const available = maxSupply - totalSupply;

      return {
        maxSupply,
        totalSupply,
        available,
      };
    } catch (error) {
      console.error(error);
      throw new SmartContractException(error);
    }
  }

  async transferFromToUser({ nftFractionAddress, sendTo, amount, senderAddress }: TransferTokensByAddressDto) {
    const senderWallet = await this.walletsService.findOne({ address: senderAddress })
    if (!senderWallet)
      throw new HttpException('Wallet not found', HttpStatusCode.BadRequest)
    const result = await this.TransferTokens(senderWallet._id, { nftFractionAddress, sendTo, amount })
    return result
  }


  async TransferTokens(walletId, { nftFractionAddress, sendTo, amount }: TransferTokensDto) {
    try {
      const asset = await this.assetService.findOne({ nftFractionAddress })
      if (!asset)
        throw new HttpException('Asset not found', HttpStatusCode.BadRequest)
      const wallet = await this.walletsService.initializeManagedWalletById(walletId);
      await this.walletsService.chargeWalletWithGas(wallet.address)
      const FractionContract = new ethers.Contract(asset.nftFractionAddress, this.erc20Abi, wallet);
      const senderBalance = await FractionContract.balanceOf(wallet.address)
      if (senderBalance < amount)
        throw new HttpException('Insufficient balance', HttpStatusCode.BadRequest)
      const tx = await FractionContract.transfer(sendTo, amount)
      const receipt = await tx.wait();
      return { message: 'success', hashAddress: receipt?.hash };
    } catch (error) {
      console.error(error);
      throw new SmartContractException(error);
    }
  }





  async transferOwnership(walletId: string, { assetFractionsTokenAddress }: TransferOwnershipDto) {
    const newOwnerAddress = OWNER_WALLET_ADDRESS;
    try {
      const contract = await this.initializeContractByWalletId(walletId, assetFractionsTokenAddress);

      const gasLimit = await this.walletsService.estimateGasForTransaction(walletId, assetFractionsTokenAddress, 'transferOwnership', this.assetFractionsTokenAbi, newOwnerAddress);

      const tx = await contract.transferOwnership(newOwnerAddress, {
        gasLimit: gasLimit,
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

  private async initializeContractByWalletId(walletId: string, contractAddress: string) {
    const wallet = await this.walletsService.initializeManagedWalletById(walletId);
    const contract = new ethers.Contract(contractAddress, this.assetFractionsTokenAbi, wallet);
    return contract;
  }

  private initializeContractByLocalWallet(contractAddress: string) {
    const wallet = this.walletsService.initializeLocalWallet();
    const contract = new ethers.Contract(contractAddress, this.assetFractionsTokenAbi, wallet);
    return contract;
  }

  async burnTokens(walletId: string, { nftFractionAddress, amount, from }: BurnTokensDto) {
    try {
      const wallet = await this.walletsService.initializeManagedWalletById(walletId);
      await this.walletsService.chargeWalletWithGas(wallet.address)
      const fractionContract = new ethers.Contract(nftFractionAddress, this.erc20Abi, wallet);
      const tx = await fractionContract.burn(from, amount);
      await tx.wait();
      return { message: 'success' }
    } catch (error) {
      console.error(error);
      throw new SmartContractException(error);
    }
  }

}
