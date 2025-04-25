import { Module } from '@nestjs/common';
import { KycProviderController } from './kyc-provider.controller';
import { KycProviderAdminController } from './kyc-provider.controller.admin';
import { KycProviderService } from './kyc-provider.service';

@Module({
  controllers: [KycProviderController, KycProviderAdminController],
  providers: [KycProviderService],
})
export class KycProviderModule { }
