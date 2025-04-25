import { Module } from '@nestjs/common';
import { DepositService } from './deposit.service';
import { DepositController } from './deposit.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Deposit, DepositSchema } from './schemas/deposit.schema';
import { AdminDepositController } from './deposit.admin.controller';
import { S3Module } from '../../aws/s3/s3.module';
import { DepositRepository } from './deposit.repository';
import { UsersModule } from '../../users/users.module';

@Module({
  imports: [
    UsersModule,
    MongooseModule.forFeature([{ name: Deposit.name, schema: DepositSchema }]),
    S3Module,
  ],
  controllers: [DepositController, AdminDepositController],
  providers: [DepositService, DepositRepository],
  exports: [DepositService],
})
export class DepositModule { }
