import { Controller, Get } from '@nestjs/common';
import { kycProviders } from '../providers-info/providers';


@Controller('kyc-providers')
export class KycProviderController {

  // @Get('sumsub')
  // getProviders() {
  //   return kycProviders
  // }
}
