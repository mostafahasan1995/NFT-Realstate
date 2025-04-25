import {Injectable} from '@nestjs/common';
import {ethers} from 'ethers';
import {AssetsCollectionContract} from './artifacts/assets-collection.contract';
import {WalletsService} from '../../../wallets/wallets.service';
import {MintTokenDto} from './dto/mint-token.dto';
import {ApproveFractionAddressDto} from './dto/approve-fraction-address.dto';
import {DeployAssetCollectionContractDto} from './dto/deploy-asset-collection.dto';
import {SmartContractException} from '../../../contracts/exceptions/contract.exception';
import {AssetCollectionRepository} from './asset-collection.repository';
import {EthersProviderService} from '../../../ethers-provider/ethers-provider.service';

@Injectable()
export class AssetsCollectionService {
  private readonly assetsCollectionAbi = AssetsCollectionContract.ABI;
  private readonly assetsCollectionByteCode = AssetsCollectionContract.Bytecode;

  constructor(
    private readonly contractAssetsCollectionRepository: AssetCollectionRepository,
    private readonly ethersProviderService: EthersProviderService,
    private readonly walletsService: WalletsService
  ) {}

  async findAllCollections() {
    return await this.contractAssetsCollectionRepository.find();
  }

  async findAllTokens() {
    return await this.contractAssetsCollectionRepository.model.find(
      {},
      'tokenIds'
    );
  }

  async deployAssetCollection(
    walletId: string,
    {name, tracker}: DeployAssetCollectionContractDto
  ) {
    // initialize managed wallet
    const wallet = await this.walletsService.initializeManagedWalletById(
      walletId
    );

    try {
      const abi = this.assetsCollectionAbi;
      const bytecode = this.assetsCollectionByteCode;
      const contract = new ethers.ContractFactory(abi, bytecode, wallet);

      const deployedContract = await contract.deploy(name, tracker, {
        gasLimit: 8_000_000,
      });
      await deployedContract.getDeployedCode();
      const address = await deployedContract.getAddress();

      // Save to database
      const assetCollection = {
        assetCollectionAddress: address,
        ownerAddress: wallet.address,
        name: name,
        tracker: tracker,
      };
      const collection = await this.contractAssetsCollectionRepository.create(
        assetCollection
      );

      return collection;
    } catch (error) {
      console.error(error);
      throw new SmartContractException(error);
    }
  }

  async mintToken(walletId: string, mintTokenDto: MintTokenDto) {
    const {
      assetCollectionAddress,
      deedInfo,
      location,
      mv,
      mvCurrency,
      mvTimestamp,
      url,
    } = mintTokenDto;
    // initialize managed wallet
    const wallet = await this.walletsService.initializeManagedWalletById(
      walletId
    );

    try {
      const abi = this.assetsCollectionAbi;
      const contract = new ethers.Contract(assetCollectionAddress, abi, wallet);

      const gasLimit = await this.walletsService.estimateGasForTransaction(
        walletId,
        assetCollectionAddress,
        'mint',
        this.assetsCollectionAbi,
        deedInfo,
        location,
        mv,
        mvCurrency,
        mvTimestamp,
        url
      );

      const transaction = await contract.mint(
        deedInfo,
        location,
        mv,
        mvCurrency,
        mvTimestamp,
        url,
        {
          gasLimit: gasLimit,
        }
      );
      const receipt = await transaction.wait();
      const tokenId = parseInt(receipt.logs[0].topics[3], 16);

      const assetToken = {
        tokenId,
        address: receipt.hash,
      };

      // Save to database
      await this.contractAssetsCollectionRepository.model.updateOne(
        {assetCollectionAddress},
        {$push: {tokenIds: assetToken}}
      );

      return assetToken;
    } catch (error) {
      console.error(error);
      throw new SmartContractException(error);
    }
  }

  async approveFractionAddress(
    walletId: string,
    {
      assetCollectionAddress,
      assetFractionsTokenAddress,
      tokenId,
    }: ApproveFractionAddressDto
  ) {
    // initialize managed wallet
    const wallet = await this.walletsService.initializeManagedWalletById(
      walletId
    );

    try {
      const abi = this.assetsCollectionAbi;
      const contract = new ethers.Contract(assetCollectionAddress, abi, wallet);

      // Calculate gas limit using web3
      const gasLimit = await this.walletsService.estimateGasForTransaction(
        walletId,
        assetCollectionAddress,
        'approve',
        this.assetsCollectionAbi,
        assetFractionsTokenAddress,
        tokenId
      );

      const transaction = await contract.approve(
        assetFractionsTokenAddress,
        tokenId,
        {
          gasLimit: gasLimit,
        }
      );
      await transaction.wait();

      const assetToken = {
        tokenId,
        hash: transaction.hash,
      };

      return assetToken;
    } catch (error) {
      console.error(error);
      throw new SmartContractException(error);
    }
  }
}
