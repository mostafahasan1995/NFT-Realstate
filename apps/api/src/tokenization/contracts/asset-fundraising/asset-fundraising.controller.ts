import { Controller, Body, Post, Request } from '@nestjs/common';
import { AssetFundraisingService } from './asset-fundraising.service';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CheckManagedWallet } from '../../../wallets/decorators/check-managed-wallet.decorator';
import { FundraisingAddressDto } from './dto/fundraising-address.dto';
import { RefundDto } from './dto/refund.dto';
import { BuyFractionDto } from './dto/buy-fraction.dto';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { GetPriceDto } from './dto/get-price.dto';
import { DeployFundraisingDto } from './dto/deploy-fundraising.dto';
import { SetAllowedTokenDto } from './dto/set-allowed-token.dto';

@ApiBearerAuth()
@ApiTags('tokenization/fundraising')
@Controller('tokenization/fundraising')
export class AssetFundraisingController {
  constructor(
    private readonly assetFundraisingService: AssetFundraisingService
  ) {}

  @Post('deploy')
  async deployAssetCollection(
    @CheckManagedWallet() { walletId },
    @Body() deployFundraisingDto: DeployFundraisingDto
  ) {
    return await this.assetFundraisingService.deploy(
      walletId,
      deployFundraisingDto
    );
  }

  @Post('set-allowed-token')
  async setAllowedToken(
    @CheckManagedWallet() { walletId },
    @Body() setAllowedTokenDto: SetAllowedTokenDto
  ) {
    return await this.assetFundraisingService.setAllowedToken(
      walletId,
      setAllowedTokenDto
    );
  }

  @Post('get-price')
  async getPrice(@Body() getPriceDto: GetPriceDto) {
    const price = await this.assetFundraisingService.getPrice(getPriceDto);

    return {
      price,
    };
  }

  @Post('buy')
  async buyFraction(
    @Request() { user },
    @CheckManagedWallet() { walletId },
    @Body() buyFunctionDto: BuyFractionDto
  ) {
    return await this.assetFundraisingService.buyFraction(
      user,
      walletId,
      buyFunctionDto
    );
  }

  @Post('refund')
  async refund(
    @CheckManagedWallet() { walletId },
    @Body() refundDto: RefundDto
  ) {
    return await this.assetFundraisingService.refund(walletId, refundDto);
  }

  @Post('status')
  async contractStatus(@Body() fundraisingAddressDto: FundraisingAddressDto) {
    const status = await this.assetFundraisingService.getFundraisingStatus(
      fundraisingAddressDto
    );

    return { status };
  }

  @Post('transactions/external/new')
  async buyFractionExternalWallet(
    @Request() { user },
    @Body() createTransactionDto: CreateTransactionDto
  ) {
    const transaction =
      await this.assetFundraisingService.buyFractionExternalWallet(
        user,
        createTransactionDto
      );

    return transaction;
  }
}
