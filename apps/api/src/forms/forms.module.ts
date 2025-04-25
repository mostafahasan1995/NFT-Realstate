import { Module } from '@nestjs/common';
import { FormsService } from './forms.service';
import { FormsController } from './forms.controller';
import { FormRepository } from './forms.repository';
import { FormsAdminController } from './forms.admin.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Form, FormSchema } from './schemas/form.schema';
import { FundingRequests, FundingRequestsSchema } from './schemas/funding-requests.form.schema';
import { FundingRequestsRepository } from './forms.funding-request';
import { AuthModule } from '../auth/auth.module';
export const MY_FUNCTION = 'MY_FUNCTION';
@Module({
  imports: [
    MongooseModule.forFeature([{ name: Form.name, schema: FormSchema }]),
    MongooseModule.forFeature([{ name: FundingRequests.name, schema: FundingRequestsSchema }]),
    AuthModule
  ],
  controllers: [FormsController, FormsAdminController],
  providers: [FormsService, FormRepository, FundingRequestsRepository],
  exports: [FormsService],
})
export class FormsModule { }
