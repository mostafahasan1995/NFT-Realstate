import {Injectable} from '@nestjs/common';
import {InjectModel} from '@nestjs/mongoose';
import {Model} from 'mongoose';
import {ethers} from 'ethers';
import {ABIs} from '../../../contracts/artifacts/abis.contract';
import {OrderBookContract} from './artifacts/order-book.contract';
import {WalletsService} from '../../../wallets/wallets.service';
import {Order, TokenizationOrderBook} from './schemas/order-book.schema';
import {InitDto} from './dto/init.dto';
import {SetFeesDto} from './dto/set-fees.dto';
import {ListOrderDto} from './dto/list-order.dto';
import {BuyOrderDto} from './dto/buy.dto';
import {OrderBookAddressDto} from './dto/order-book-address.dto';
import {BalanceOfDto} from './dto/balance-of.dto';
import {SmartContractException} from '../../../contracts/exceptions/contract.exception';
import {AssetService} from '../../../asset/asset.service';
import {EventEmitter2} from '@nestjs/event-emitter';

import {InvoiceEmailEvent} from '../../../aws/ses/events/invoice-email.event';
import {IOrder} from './interfaces/order.interface';
import {OrderBookAndWalletDto} from './dto/orderbook-and-wallet.dto';
import {ContractsService} from '../../../contracts/contracts.service';
import {UnlistOrderDto} from './dto/unlist.dto';


@Injectable()
export class AssetOrderBookService {
  private readonly erc20Abi = ABIs.ERC20;
  private readonly orderBookAbi = OrderBookContract.ABI;
  private readonly orderBookByteCode = OrderBookContract.BYTECODE;

  constructor(
    @InjectModel(TokenizationOrderBook.name)
    private readonly tokenizationOrderBookModel: Model<TokenizationOrderBook>,
    private readonly walletsService: WalletsService,
    private readonly assetService: AssetService,
    private readonly contractsService: ContractsService,
    private readonly eventEmitter: EventEmitter2
  ) {}

  async findAll(): Promise<TokenizationOrderBook[]> {
    return await this.tokenizationOrderBookModel.find();
  }

  async findOneByOrderId(
    orderBookAddress: string,
    orderId: number
  ): Promise<Order> {
    const orderBook = await this.tokenizationOrderBookModel.findOne({
      orderBookAddress,
      'orders.orderId': orderId,
    });

    return orderBook.orders.find((order) => order.orderId === orderId);
  }

  async deployContract(walletId: string) {
    // Get managed wallet
    const managedWallet = await this.walletsService.findById(walletId);

    // initialize managed wallet
    const wallet = await this.walletsService.initializeManagedWalletById(
      walletId
    );

    try {
      const abi = this.orderBookAbi;
      const bytecode = this.orderBookByteCode;
      const factory = new ethers.ContractFactory(abi, bytecode, wallet);
      const contract = await factory.deploy({
        gasLimit: 6_000_000,
      });
      await contract.getDeployedCode();
      const address = await contract.getAddress();

      // Save to database
      const orderBook = await this.tokenizationOrderBookModel.create({
        orderBookAddress: address,
        ownerAddress: managedWallet.address,
      });

      return orderBook;
    } catch (error) {
      console.error(error);
      throw new SmartContractException(error);
    }
  }

  async init(walletId: string, {orderBookAddress, fractionAddress}: InitDto) {
    // initialize managed wallet
    const wallet = await this.walletsService.initializeManagedWalletById(
      walletId
    );

    try {
      const abi = this.orderBookAbi;
      const contract = new ethers.Contract(orderBookAddress, abi, wallet);
      const transaction = await contract.init(fractionAddress, {
        gasLimit: 6_000_000,
      });
      await transaction.wait();

      // Save to database
      const orderBook = await this.tokenizationOrderBookModel.findOneAndUpdate(
        {orderBookAddress},
        {fractionsAddress: fractionAddress},
        {new: true}
      );

      return orderBook;
    } catch (error) {
      console.error(error);
      throw new SmartContractException(error);
    }
  }

  async setFees(
    walletId: string,
    {orderBookAddress, makerFee, takerFee}: SetFeesDto
  ) {
    // initialize managed wallet
    const wallet = await this.walletsService.initializeManagedWalletById(
      walletId
    );

    try {
      const abi = this.orderBookAbi;
      const contract = new ethers.Contract(orderBookAddress, abi, wallet);
      const transaction = await contract.setFees(
        ethers.parseEther(`${makerFee}`),
        ethers.parseEther(`${takerFee}`),
        {
          gasLimit: 6_000_000,
        }
      );
      await transaction.wait();

      // Save to database
      const orderBook = await this.tokenizationOrderBookModel.findOneAndUpdate(
        {orderBookAddress},
        {
          makerFee,
          takerFee,
        },
        {new: true}
      );

      return orderBook;
    } catch (error) {
      console.error(error);
      throw new SmartContractException(error);
    }
  }

  async listOrder(
    user: any,
    walletId: string,
    {orderBookAddress, amount, price, priceToken, minAmount}: ListOrderDto
  ) {
    // initialize managed wallet
    const wallet = await this.walletsService.initializeManagedWalletById(
      walletId
    );
    await this.walletsService.checkAndChargeWalletGas(walletId);

    try {
      const abi = this.orderBookAbi;
      const contract = new ethers.Contract(orderBookAddress, abi, wallet);
      const fractionContract = await contract.fractionsContract();

      const erc20Contract = new ethers.Contract(
        fractionContract,
        this.erc20Abi,
        wallet
      );
      const approveTX = await erc20Contract.approve(
        orderBookAddress,
        BigInt(amount)
      );
      await approveTX.wait();

      const transaction = await contract.list(
        BigInt(amount),
        BigInt(ethers.parseEther(price.toString())),
        priceToken,
        BigInt(minAmount)
      );
      const receipt = await transaction.wait();

      // Retrieve orderId from the recept
      const orderId = parseInt(receipt.logs[2].topics[1], 16);

      // Get token by address
      const token = this.contractsService.getTokenByAddress(priceToken);

      // Create a new order
      const orderData: Order = {
        orderId,
        owner: wallet.address,
        amount,
        price,
        tokenAddress: priceToken,
        tokenSymbol: token.symbol,
        minAmount,
      };

      // Update the order book's list of orders
      await this.tokenizationOrderBookModel.updateOne(
        {orderBookAddress},
        {$push: {orders: orderData}}
      );

      // Emit send sell invoice email event
      const asset = await this.assetService.findOne({
        nftOrderBookAddress: orderBookAddress,
      });
      this.eventEmitter.emit(
        'email.sellInvoice',
        new InvoiceEmailEvent(
          user.email,
          user.name,
          `https://platform.gammacities.com/market/${asset.slug}`,
          `${asset.images[0]['url']}`,
          `${receipt.hash}`,
          asset.name,
          `${amount}`,
          `${price * amount} ${token.symbol === 'GUSD' ? 'USD' : token.symbol}`
        )
      );

      return orderData;
    } catch (error) {
      console.error(error);
      throw new SmartContractException(error);
    }
  }

  async unlistOrder(
    user: any,
    walletId: string,
    {orderBookAddress, orderId, amount}: UnlistOrderDto
  ) {
    // initialize managed wallet
    const wallet = await this.walletsService.initializeManagedWalletById(
      walletId
    );

    // Check and recharge of wallet eth if low
    await this.walletsService.checkAndChargeWalletGas(walletId);

    try {
      const fractionAddress = await this.getFractionContract(orderBookAddress);

      const abi = this.orderBookAbi;
      const contract = new ethers.Contract(orderBookAddress, abi, wallet);

      const transaction = await contract.unlist(orderId, BigInt(amount));
      const receipt = await transaction.wait();

      const transactionData = {
        orderBookAddress,
        orderId,
        amount,
        transactionHash: transaction.hash,
      };

      return transactionData;
    } catch (error) {
      console.error(error);
      throw new SmartContractException(error);
    }
  }
  async buyOrder(
    user: any,
    walletId: string,
    {orderBookAddress, orderId, amount, price, tokenAddress}: BuyOrderDto
  ) {
    // initialize managed wallet
    const wallet = await this.walletsService.initializeManagedWalletById(
      walletId
    );

    // Check and recharge of wallet eth if low
    await this.walletsService.checkAndChargeWalletGas(walletId);

    try {
      const fractionAddress = await this.getFractionContract(orderBookAddress);

      const abi = this.orderBookAbi;
      const contract = new ethers.Contract(orderBookAddress, abi, wallet);

      const totalPrice = price * amount;
      const formattedPrice = BigInt(ethers.parseEther(totalPrice.toString()));
      const erc20TokenContract = new ethers.Contract(
        tokenAddress,
        this.erc20Abi,
        wallet
      );
      const approveTokenTX = await erc20TokenContract.approve(
        orderBookAddress,
        formattedPrice
      );
      await approveTokenTX.wait();
      const erc20FractionContract = new ethers.Contract(
        fractionAddress,
        this.erc20Abi,
        wallet
      );
      const approveFractionTX = await erc20FractionContract.approve(
        wallet.address,
        amount
      );
      await approveFractionTX.wait();

      const transaction = await contract.buy(orderId, BigInt(amount));
      const receipt = await transaction.wait();

      const transactionData = {
        orderBookAddress,
        orderId,
        amount,
        transactionHash: transaction.hash,
      };

      // Emit send buy invoice email event
      const token = this.contractsService.getTokenByAddress(tokenAddress);
      const asset = await this.assetService.findOne({
        nftOrderBookAddress: orderBookAddress,
      });
      this.eventEmitter.emit(
        'email.buyInvoice',
        new InvoiceEmailEvent(
          user.email,
          user.name,
          `https://platform.gammacities.com/market/${asset.slug}`,
          `${asset.images[0]['url']}`,
          `${receipt.hash}`,
          asset.name,
          `${amount}`,
          `${totalPrice} ${token.symbol === 'GUSD' ? 'USD' : token.symbol}`
        )
      );

      return transactionData;
    } catch (error) {
      console.error(error);
      throw new SmartContractException(error);
    }
  }

  async getOrders({orderBookAddress}: OrderBookAddressDto) {
    // initialize local wallet
    const wallet = await this.walletsService.initializeLocalWallet();

    try {
      const abi = this.orderBookAbi;
      const contract = new ethers.Contract(orderBookAddress, abi, wallet);
      const orders = await contract.orders();

      // Serialize and map the data to meaningful keys for better understanding
      const serializedOrders: IOrder[] = orders.map(
        (order): IOrder => ({
          orderId: Number(order[0]),
          amount: Number(order[1]),
          owner: order[2],
          price: Number(ethers.formatEther(order[3])),
          tokenAddress: order[4],
          minAmount: Number(order[5]),
        })
      );

      // Filter out orders that have been filled
      const filteredOrders = serializedOrders.filter(
        (order) => order.amount > 0
      );

      // Sort the orders by id in descending order
      filteredOrders.sort((a, b) => b.orderId - a.orderId);

      return filteredOrders;
    } catch (error) {
      console.error(error);
      throw new SmartContractException(error);
    }
  }

  async getOrdersByOwner({
    orderBookAddress,
    walletAddress,
  }: OrderBookAndWalletDto) {
    // initialize local wallet
    const wallet = await this.walletsService.initializeLocalWallet();

    try {
      const abi = this.orderBookAbi;
      const contract = new ethers.Contract(orderBookAddress, abi, wallet);
      const orders = await contract.getOrdersByOwner(walletAddress);

      // Serialize and map the data to meaningful keys for better understanding
      const serializedOrders: IOrder[] = orders.map(
        (order): IOrder => ({
          orderId: Number(order[0]),
          amount: Number(order[1]),
          owner: order[2],
          price: Number(ethers.formatEther(order[3])),
          tokenAddress: order[4],
          minAmount: Number(order[5]),
        })
      );

      // Filter out orders that have been filled
      const filteredOrders = serializedOrders.filter(
        (order) => order.amount > 0
      );

      // Sort the orders by id in descending order
      filteredOrders.sort((a, b) => b.orderId - a.orderId);

      return filteredOrders;
    } catch (error) {
      console.error(error);
      throw new SmartContractException(error);
    }
  }

  async balanceOf({orderBookAddress, userAddress}: BalanceOfDto) {
    // initialize local wallet
    const wallet = this.walletsService.initializeLocalWallet();

    try {
      const abi = this.orderBookAbi;
      const contract = new ethers.Contract(orderBookAddress, abi, wallet);
      const balance = await contract.balanceOf(userAddress);

      return Number(balance);
    } catch (error) {
      console.error(error);
      throw new SmartContractException(error);
    }
  }

  async getFractionContract(orderBookAddress: string) {
    try {
      // initialize local wallet
      const wallet = await this.walletsService.initializeLocalWallet();

      const abi = this.orderBookAbi;
      const contract = new ethers.Contract(orderBookAddress, abi, wallet);
      const fractionsContract = await contract.fractionsContract();

      return fractionsContract;
    } catch (error) {
      console.error(error);
      throw new SmartContractException(error);
    }
  }
}
