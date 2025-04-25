import {Module} from '@nestjs/common';
import {Bitrix24Service} from './bitrix24.service';
import {Bitrix24Controller} from './bitrix24.controller';
import {MongooseModule} from '@nestjs/mongoose';
import {Bitrix24, Bitrix24Schema} from './schemas/bitrix24.schema';
import {Bitrix24Repository} from './bitrix24.repository';
import {AdminBitrix24Controller} from './bitrix24.admin.controller';

@Module({
  imports: [
    MongooseModule.forFeature([{name: Bitrix24.name, schema: Bitrix24Schema}]),
  ],
  controllers: [Bitrix24Controller, AdminBitrix24Controller],
  providers: [Bitrix24Service, Bitrix24Repository],
  exports: [Bitrix24Service],
})
export class Bitrix24Module {}
