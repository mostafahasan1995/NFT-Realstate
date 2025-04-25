import { Module } from '@nestjs/common';
import { KmsService } from './kms.service';
import { KmsController } from './kms.controller';

@Module({
  controllers: [KmsController],
  providers: [KmsService],
  exports: [KmsService],
})
export class KmsModule {}
