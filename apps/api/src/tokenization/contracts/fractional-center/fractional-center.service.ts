import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ethers } from 'ethers';

import { FractionalCenterContract } from './artifacts/fractional-center.contract';
import { WalletsService } from '../../../wallets/wallets.service';
import { TokenizationFractionalCenter } from './schemas/fractional-center.schema';
import { FractionalAndWalletDto } from './dto/fractional-and-wallet.dto';
import { SmartContractException } from '../../../contracts/exceptions/contract.exception';
import { RemoveFractionAddressDto } from './dto/remove-fraction-address.dto';
import { IFractionBalance } from './interfaces/fraction-balance.interface';
import { AddFractionAddressDto } from './dto/add-fraction-address.dto';
import { FractionalCenterAddressDto } from './dto/fractional-center-address.dto';
import { IFractionOrder } from './interfaces/fraction-order.interface';
import { IOrder } from '../asset-order-book/interfaces/order.interface';

@Injectable()
export class FractionalCenterService {
  private readonly fractionalCenterAbi = FractionalCenterContract.ABI;
  private readonly fractionalCenterByteCode = FractionalCenterContract.BYTECODE;

  constructor(
    @InjectModel(TokenizationFractionalCenter.name)
    private readonly tokenizationFractionalCenterModel: Model<TokenizationFractionalCenter>,
    private readonly walletsService: WalletsService
  ) {}

  async create(
    fractionalCenterDto: Partial<TokenizationFractionalCenter>
  ): Promise<TokenizationFractionalCenter> {
    return this.tokenizationFractionalCenterModel.create(fractionalCenterDto);
  }

  async findAll(): Promise<TokenizationFractionalCenter[]> {
    return this.tokenizationFractionalCenterModel.find();
  }

  async findOne(
    fractionalCenterDto: Partial<TokenizationFractionalCenter>
  ): Promise<TokenizationFractionalCenter> | undefined {
    return this.tokenizationFractionalCenterModel.findOne(fractionalCenterDto);
  }

  async getActiveCenter(): Promise<TokenizationFractionalCenter> {
    const fractionalCenter = await this.findOne({ isActiveCenter: true });

    if (!fractionalCenter) {
      throw new BadRequestException(`No active fractional center found`);
    }

    return fractionalCenter;
  }

  async activateCenter(fractionalCenterAddressDto: FractionalCenterAddressDto) {
    const fractionalCenter = await this.findOne(fractionalCenterAddressDto);

    if (!fractionalCenter) {
      throw new BadRequestException(
        `Fractional Center with given address does not exist`
      );
    }

    // Deactivate all other centers
    await this.tokenizationFractionalCenterModel.updateMany(
      {},
      { isActiveCenter: false }
    );

    // Activate the center and return the updated document
    return await this.tokenizationFractionalCenterModel.findOneAndUpdate(
      fractionalCenterAddressDto,
      { $set: { isActiveCenter: true } },
      { new: true }
    );
  }

  async deployContract(walletId: string) {
    // initialize managed wallet
    const wallet = await this.walletsService.initializeManagedWalletById(
      walletId
    );

    const abi = this.fractionalCenterAbi;
    const bytecode = this.fractionalCenterByteCode;
    const factory = new ethers.ContractFactory(abi, bytecode, wallet);
    const contract = await factory.deploy({ gasLimit: 6_000_000 });
    await contract.getDeployedCode();
    const fractionalCenterAddress = await contract.getAddress();

    // Save to database
    const fractionalCenter = await this.create({
      fractionalCenterAddress,
    });

    return fractionalCenter;
  }

  async getFractionAddresses({
    fractionalCenterAddress,
  }: FractionalCenterAddressDto) {
    // initialize local wallet
    const wallet = await this.walletsService.initializeLocalWallet();

    try {
      const abi = this.fractionalCenterAbi;
      const contract = new ethers.Contract(
        fractionalCenterAddress,
        abi,
        wallet
      );
      const fractionAddresses = await contract.getFractionAddresses();

      return fractionAddresses;
    } catch (error) {
      console.error(error);
      throw new SmartContractException(error);
    }
  }

  async addFractionAddress(
    walletId: string,
    { fractionalCenterAddress, fractionAddress }: AddFractionAddressDto
  ) {
    // initialize managed wallet
    const wallet = await this.walletsService.initializeManagedWalletById(
      walletId
    );

    try {
      const abi = this.fractionalCenterAbi;
      const contract = new ethers.Contract(
        fractionalCenterAddress,
        abi,
        wallet
      );
      const tx = await contract.addFractionAddress(fractionAddress, {
        gasLimit: 6_000_000,
      });
      const receipt = await tx.wait();

      return receipt;
    } catch (error) {
      console.error(error);
      throw new SmartContractException(error);
    }
  }

  async removeFractionAddress(
    walletId: string,
    { fractionalCenterAddress, fractionAddress }: RemoveFractionAddressDto
  ) {
    // initialize managed wallet
    const wallet = await this.walletsService.initializeManagedWalletById(
      walletId
    );

    try {
      const abi = this.fractionalCenterAbi;
      const contract = new ethers.Contract(
        fractionalCenterAddress,
        abi,
        wallet
      );
      const tx = await contract.removeFractionAddress(fractionAddress, {
        gasLimit: 6_000_000,
      });
      const receipt = await tx.wait();

      return receipt;
    } catch (error) {
      console.error(error);
      throw new SmartContractException(error);
    }
  }

  async getFractionsBalance({
    fractionalCenterAddress,
    walletAddress,
  }: FractionalAndWalletDto): Promise<IFractionBalance[]> {
    // initialize local wallet
    const wallet = await this.walletsService.initializeLocalWallet();

    try {
      const abi = this.fractionalCenterAbi;
      const contract = new ethers.Contract(
        fractionalCenterAddress,
        abi,
        wallet
      );
      const balances = await contract.balancesOf(walletAddress);

      // Serialize and map the data to meaningful keys for better understanding
      const serializedBalances: IFractionBalance[] = balances
        .map(
          (balance): IFractionBalance => ({
            address: balance[0],
            name: balance[1],
            amount: Number(balance[2]),
            isSecondaryMarket: balance[3],
          })
        )
        .filter((balance) => balance.amount > 0);

      return serializedBalances;
    } catch (error) {
      console.error(error);
      throw new SmartContractException(error);
    }
  }

  async getFractionsBalanceWithEnabledSecondaryMarket({
    fractionalCenterAddress,
    walletAddress,
  }: FractionalAndWalletDto): Promise<IFractionBalance[]> {
    const fractionsBalances = await this.getFractionsBalance({
      fractionalCenterAddress,
      walletAddress,
    });

    return fractionsBalances.filter((balance) => balance.isSecondaryMarket);
  }

  async getOrders({
    fractionalCenterAddress,
    walletAddress,
  }: FractionalAndWalletDto): Promise<IFractionOrder[]> {
    // initialize local wallet
    const wallet = await this.walletsService.initializeLocalWallet();

    try {
      const abi = this.fractionalCenterAbi;
      const contract = new ethers.Contract(
        fractionalCenterAddress,
        abi,
        wallet
      );
      const orders = await contract.ordersOf(walletAddress);

      // Serialize and map the data to meaningful keys for better understanding
      const serializedOrders: IFractionOrder[] = orders.map(
        (orderInfo): IFractionOrder => ({
          fractionAddress: orderInfo[0],
          orderBookAddress: orderInfo[1],
          orders: orderInfo[2].map(
            (order): IOrder => ({
              orderId: Number(order[0]),
              amount: Number(order[1]),
              owner: order[2],
              price: Number(ethers.formatEther(order[3])),
              tokenAddress: order[4],
              minAmount: Number(order[5]),
            })
          ),
        })
      );

      return serializedOrders;
    } catch (error) {
      console.error(error);
      throw new SmartContractException(error);
    }
  }
}
