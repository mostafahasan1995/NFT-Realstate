import { Body, Controller, Get, Query, Request } from '@nestjs/common';
import { TransactionsService } from './transactions.service';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { TransactionQueryDto } from './dto/transaction-query.dto';

@ApiBearerAuth()
@ApiTags('transactions')
@Controller('transactions')
export class TransactionController {
  constructor(private readonly transactionService: TransactionsService) { }

  @Get()
  async findAll(@Query() transactionQueryDto: TransactionQueryDto, @Request() { user }) {
    return this.transactionService.findAll(transactionQueryDto, user._id);
  }

  @Get('balance')
  async getCurrentBalance(@Request() { user }) {
    return this.transactionService.getCurrentBalance(user._id);
  }


}
