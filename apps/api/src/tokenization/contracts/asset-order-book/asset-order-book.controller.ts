import {Controller, Body, Post, Request} from '@nestjs/common';
import {AssetOrderBookService} from './asset-order-book.service';
import {ApiBearerAuth, ApiTags} from '@nestjs/swagger';
import {ListOrderDto} from './dto/list-order.dto';
import {BuyOrderDto} from './dto/buy.dto';
import {OrderBookAddressDto} from './dto/order-book-address.dto';
import {CheckManagedWallet} from '../../../wallets/decorators/check-managed-wallet.decorator';
import {BalanceOfDto} from './dto/balance-of.dto';
import {OrderBookAndWalletDto} from './dto/orderbook-and-wallet.dto';
import {UnlistOrderDto} from './dto/unlist.dto';

@ApiBearerAuth()
@ApiTags('tokenization/order-books')
@Controller('tokenization/order-books')
export class AssetOrderBookController {
  constructor(private readonly assetOrderBookService: AssetOrderBookService) {}

  // Modify listing by calling list again
  @Post('list')
  async list(
    @CheckManagedWallet() {walletId},
    @Request() {user},
    @Body() listOrderDto: ListOrderDto
  ) {
    return await this.assetOrderBookService.listOrder(
      user,
      walletId,
      listOrderDto
    );
  }

  // Modify listing by calling list again
  @Post('unlist')
  async unlist(
    @CheckManagedWallet() {walletId},
    @Request() {user},
    @Body() unlistOrderDto: UnlistOrderDto
  ) {
    return await this.assetOrderBookService.unlistOrder(
      user,
      walletId,
      unlistOrderDto
    );
  }

  @Post('buy')
  async buy(
    @CheckManagedWallet() {walletId},
    @Request() {user},
    @Body() buyOrderDto: BuyOrderDto
  ) {
    return await this.assetOrderBookService.buyOrder(
      user,
      walletId,
      buyOrderDto
    );
  }

  @Post('orders')
  async getOrders(@Body() orderBookAddressDto: OrderBookAddressDto) {
    return await this.assetOrderBookService.getOrders(orderBookAddressDto);
  }

  @Post('orders-by-owner')
  async getOrdersByOwner(@Body() orderBookAndWalletDto: OrderBookAndWalletDto) {
    return await this.assetOrderBookService.getOrdersByOwner(
      orderBookAndWalletDto
    );
  }

  @Post('balanceOf')
  async balanceOf(@Body() balanceOfDto: BalanceOfDto) {
    return await this.assetOrderBookService.balanceOf(balanceOfDto);
  }

  // TODO: Add more endpoints
  // fractionsContract get the fraction address of this listing
}
