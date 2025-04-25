import { BadRequestException, HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Wallet } from './schemas/wallet.schema';
import { Wallet as EtherWallet, ethers } from 'ethers';
import { UsersService } from '../users/users.service';
import { KmsService } from '../aws/kms/kms.service';
import { WalletEthersService } from './wallet-ethers.service';
import { EthersProviderService } from '../ethers-provider/ethers-provider.service';
import { BalanceDto } from './dto/balance.dto';
import { EthBalance } from './interfaces/eth-balance.interface';
import { TokenBalances } from './interfaces/token-balances.interface';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { ChargeWalletEmailEvent } from '../aws/ses/events/charge-wallet-request.event';
import { WalletConnectionEmailEvent } from '../aws/ses/events/wallet-connection-email.event';
import { wait } from '../common/utils/wait.util';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { HttpStatusCode } from 'axios';
import { User } from '../users/schemas/user.schema';
import { WalletType } from '../users/enums/wallet-type.enum';

@Injectable()
export class WalletsService {
  private readonly walletPrivateKey = process.env.WALLET_PRIVATE_KEY;
  private readonly gasAmount = 0.00082; // 0.50 USD
  private readonly minGasBalance = 0.00033; // 0.20 USD

  constructor(
    @InjectModel(Wallet.name)
    private readonly walletModel: Model<Wallet>,
    @Inject(CACHE_MANAGER)
    private cacheManager: Cache,
    private readonly walletEthersService: WalletEthersService,
    private readonly ethersProviderService: EthersProviderService,
    private readonly kmsService: KmsService,
    private readonly userService: UsersService,
    private eventEmitter: EventEmitter2
  ) { }

  async createManagedWallet(userId: string) {
    // Check if user exist
    const user = await this.userService.findOne({ _id: userId });
    if (!user) {
      throw new BadRequestException('User with the givin id is not exist');
    }

    // Check if the user already has a managed wallet
    const existingWallet = await this.walletModel.findOne({ userId });
    if (existingWallet) {
      throw new BadRequestException('User already has a managed wallet');
    }

    // Check if the user already has an external wallet
    const existingExternalWallet = await this.userService.findOne({
      _id: userId,
    });
    if (existingExternalWallet.wallets.length) {
      throw new BadRequestException('User already has an external wallet');
    }

    try {
      // Generate a new wallet
      const wallet = this.walletEthersService.createEthWallet();

      // Encrypt the private key
      const encryptedPrivateKey = await this.kmsService.encryptData(
        wallet.privateKey
      );

      // Store the wallet data in the database
      const walletData = {
        userId,
        address: wallet.address,
        key: encryptedPrivateKey,
      };

      const createdWallet = await this.walletModel.create(walletData);

      // Update user with the wallet id
      await this.userService.assignWalletId(
        userId,
        createdWallet._id,
        createdWallet.address
      );

      // Emit send wallet connection email event
      this.eventEmitter.emit(
        'email.walletConnection',
        new WalletConnectionEmailEvent(user.email, user.name, wallet.address)
      );

      return createdWallet;
    } catch (error) {
      console.error('Error creating wallet:', error);
      throw new BadRequestException('Failed to create wallet');
    }
  }

  async createExternalWallet(userId: string, walletAddress: string) {
    // Check if user exists
    const user = await this.userService.findOne({ _id: userId });
    if (!user) {
      throw new BadRequestException('User with the given id does not exist');
    }

    if (user.walletType === 'external') {
      throw new BadRequestException('You already has an external wallet');
    }

    // Check if the user already has a managed wallet
    const existingWallet = await this.walletModel.findOne({ userId });
    if (existingWallet) {
      throw new BadRequestException('You already has a managed wallet');
    }

    try {
      // Add external wallet to user
      const updatedUser = await this.userService.assignExternalWalletAddress(
        userId,
        walletAddress
      );

      // Emit send wallet connection email event
      this.eventEmitter.emit(
        'email.walletConnection',
        new WalletConnectionEmailEvent(user.email, user.name, walletAddress)
      );

      return updatedUser.wallets;
    } catch (error) {
      console.error('Error creating wallet:', error);
      throw new BadRequestException('Failed to create wallet');
    }
  }

  async connectExternalWallet(userId: string, walletAddress: string) {
    // Check if user exists
    const user = await this.userService.findOne({ _id: userId });
    if (!user) {
      throw new BadRequestException('User with the given id does not exist');
    }

    if (user.walletType === 'not_connected') {
      throw new BadRequestException('Please choses wallet type first');
    }

    // Check if the user already has a managed wallet
    const existingWallet = await this.walletModel.findOne({ userId });
    if (existingWallet) {
      throw new BadRequestException('User already has a managed wallet');
    }

    try {
      // Add external wallet to user
      const walletAddressAdded = await this.userService.assignWalletAddress(
        userId,
        walletAddress
      );

      if (walletAddressAdded) {
        // Emit send wallet connection email event
        this.eventEmitter.emit(
          'email.walletConnection',
          new WalletConnectionEmailEvent(user.email, user.name, walletAddress)
        );
      }

      return user.wallets;
    } catch (error) {
      console.error('Error creating wallet:', error);
      throw new BadRequestException('Failed to assign wallet');
    }
  }

  async findAll() {
    return await this.walletModel.find();
  }

  async findOne(query: Record<string, any>) {
    return await this.walletModel.findOne(query);
  }

  async findById(id: string) {
    return await this.walletModel.findById(id);
  }

  async archiveWallet(id: string) {
    // Check if wallet exists
    const wallet = await this.walletModel.findById(id);
    if (wallet?.archive) {
      throw new BadRequestException('Wallet is archived');
    }

    // Archive wallet when the user transfers their account from managed to external
    return await this.walletModel.findByIdAndUpdate(
      id,
      {
        archive: true,
        archiveDate: Date.now(),
      },
      {
        new: true,
      }
    );
  }

  async getBalanceByTokenAddress({
    tokenAddress,
    walletAddress,
  }: BalanceDto): Promise<number> {
    return await this.walletEthersService.getBalanceByTokenAddress({
      tokenAddress,
      walletAddress,
    });
  }

  async getBalances(
    walletAddress: string
  ): Promise<EthBalance & TokenBalances> {
    const balances = await this.walletEthersService.getTokenBalances(
      walletAddress
    );
    const eth = await this.walletEthersService.getEthBalance(walletAddress);
    return {
      ...balances,
      ...eth,
    };
  }

  async getEthBalance(walletAddress: string): Promise<EthBalance> {
    return await this.walletEthersService.getEthBalance(walletAddress);
  }

  async getTokenBalances(walletAddress: string): Promise<TokenBalances> {
    return await this.walletEthersService.getTokenBalances(walletAddress);
  }

  private async getWalletPrivateKey(id: string) {
    const privateKeyCacheKey = `walletId:${id}`;
    let privateKey = await this.cacheManager.get<string>(privateKeyCacheKey);

    if (!privateKey) {
      const wallet = await this.findById(id);
      if (!wallet || wallet?.archive) return;

      privateKey = await this.kmsService.decryptData(wallet.key);
      await this.cacheManager.set(privateKeyCacheKey, privateKey, 604800000); // Cache for 7 days
    }

    return privateKey;
  }

  async initializeManagedWalletById(walletId: string): Promise<EtherWallet> {
    const walletPrivateKey = await this.getWalletPrivateKey(walletId);
    const wallet = this.walletEthersService.initWallet(walletPrivateKey);

    return wallet;
  }

  initializeLocalWallet() {
    const walletPrivateKey = this.walletPrivateKey;
    return this.walletEthersService.initWallet(walletPrivateKey);
  }

  async chargeWalletRequest(name: string, email: string) {
    // Emit send charge wallet email event
    this.eventEmitter.emit(
      'email.chargeWalletRequest',
      new ChargeWalletEmailEvent(name, email)
    );

    return { message: 'Charge Wallet Request Received' };
  }

  async isWalletGasLow(walletAddress: string): Promise<boolean> {
    // Get wallet gas balance
    const walletGas = await this.getEthBalance(walletAddress);
    // Check if gas balance is low
    if (walletGas.balance < this.minGasBalance) {
      return true;
    }
    return false;
  }

  async checkAndChargeWalletGas(walletId: string): Promise<void> {
    // Get wallet address
    const managedWallet = await this.findById(walletId);
    const walletAddress = managedWallet.address;
    // Check if gas balance is low
    const gasBalance = await this.isWalletGasLow(walletAddress);
    if (gasBalance) {
      // Transfer gas to wallet
      await this.chargeWalletWithGas(walletAddress);
    }
  }

  async chargeWalletWithGas(recipientWalletAddress: string): Promise<string> {
    // Initialize local wallet
    const wallet = this.initializeLocalWallet();

    // Transfer Gas to wallet
    return await this.walletEthersService.chargeWalletWithGas(
      wallet,
      recipientWalletAddress,
      this.gasAmount
    );
  }

  async estimateGasForTransaction(
    walletId: string,
    contractAddress: string,
    methodName: string,
    abi: object[],
    ...args
  ): Promise<bigint> {
    await wait(10);
    try {
      const wallet = await this.initializeManagedWalletById(walletId);
      const contract = new ethers.Contract(contractAddress, abi, wallet);

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
