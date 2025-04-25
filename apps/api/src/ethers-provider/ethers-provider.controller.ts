import { Controller, Get } from '@nestjs/common';
import { EthersProviderService } from './ethers-provider.service';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('ethers-providers')
@Controller('ethers-providers')
export class EthersProviderController {
  constructor(private readonly ethersProviderService: EthersProviderService) {}

  @Get('name')
  async getNetworkName() {
    const name = await this.ethersProviderService.getNetworkName();
    return { name };
  }

  @Get('gas-price')
  async getGasPrice() {
    const gasPrice = await this.ethersProviderService.getGasPrice();
    return { gasPrice };
  }
}
