import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { TransferTokenDto } from './dto/transfer-token.dto';
import { WithdrawRepository } from './withdraw.repository';
import { WithdrawCashDto } from './dto/withdraw-cash.dto';
import { TokensService } from '../../tokenization/contracts/tokens/tokens.service';
import { generateRandomString } from '../../common/utils/random-string-generator.util';
import { WithdrawCashMangedWalletDto } from './dto/withdraw-cash-managed-wallet.dto';
import { PaginationQueryDto } from '../../common/pagination/dto/pagination-query.dto';
import { SearchQueryDto } from '../../common/pagination/dto/search-query.dto';
import { Withdraw } from './schemas/withdraw.schema';
import { S3Service } from '../../aws/s3/s3.service';
import { formatNumberToTwoDecimals } from '../../common/utils/format-number-to-decimal.util';
import { ApproveWithdrawCash } from './dto/approve-withdraw-cash.dto';
import { WithdrawStatus } from './enums/withdraw-status.enum';
import { RejectWithdrawCash } from './dto/reject-withdraw-cash.dto';
import { OtpService } from '../../otp/otp.service';
import { UpdateWithdrawDto } from './dto/update-withdraw.dto';
import { WalletsService } from '../../wallets/wallets.service';
import { FilterQuery } from '../../common/pagination/interfaces/filter-query.interface';
import { Types } from 'mongoose';
import { SearchWithdrawDto } from './dto/search-withdraw.dto';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { RequestWithdrawCashEvent } from '../../aws/ses/events/RequestWithdrawCash.event';

@Injectable()
export class WithdrawService {
  constructor(
    public readonly withdrawRepository: WithdrawRepository,
    private readonly tokensService: TokensService,
    private readonly s3Service: S3Service,
    private readonly otpService: OtpService,
    private readonly walletsService: WalletsService,
    private readonly eventEmitter2: EventEmitter2,
  ) { }

  async findWithPagination(paginationQueryDto: PaginationQueryDto, filterQueryDto: SearchQueryDto) {
    const { search } = filterQueryDto;

    // Create an empty filter object with dynamic properties.
    const filter: FilterQuery = {};

    if (search !== undefined) {
      filter.$or = [{ referenceId: { $regex: search, $options: 'i' } }];
    }

    const result = await this.withdrawRepository.findWithPagination(paginationQueryDto, filter);

    // Update invoice URL with signed URL
    const updatedData = await Promise.all(
      result.data.map(async (withdraw) => {
        return await this.updateInvoiceUrl(withdraw);
      })
    );

    return {
      ...result,
      data: updatedData,
    };
  }


  async searchWithdraw({ name, email, ...searchWithdrawDto }: SearchWithdrawDto) {
    let match: {
      'userId.name'?: object
      'userId.email'?: string
      status?: string
      referenceId?: string
    } = {}

    if (name)
      match = { ...{ ['userId.name']: { $regex: name, $options: 'i' } } }
    if (email)
      match = { ...{ ['userId.email']: email, ...match } }

    match = { ...match, ...searchWithdrawDto }
    const pipeline = [
      {
        $lookup: {
          from: 'users',
          localField: 'userId',
          foreignField: '_id',
          as: 'userId',
        },
      },
      {
        $unwind: {
          path: '$userId',
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $match: match
      }
    ]
    const withdraw = await this.withdrawRepository.model.aggregate(pipeline);

    if (withdraw.length === 0)
      throw new NotFoundException('withdraw is Not Found');

    return withdraw
  }

  async findAll(): Promise<Withdraw[]> {
    return await this.withdrawRepository.find();
  }

  async findByUserId(userId: string): Promise<Withdraw[]> {
    return await this.withdrawRepository.find({
      userId: new Types.ObjectId(userId),
    });
  }

  async updateWithdraw(id: string, updatedData: UpdateWithdrawDto) {
    await this.withdrawRepository.update({ _id: id }, updatedData);
  }

  async withdrawCash(userId: string, withdrawCashDto: WithdrawCashDto) {
    const referenceId = await this.generateReferenceId();
    const sentAmount = this.calculateSentAmount(withdrawCashDto.gusdAmount, withdrawCashDto.exchangeRate);
    const withdrawData = {
      ...withdrawCashDto,
      userId,
      sentAmount,
      referenceId,
    };
    this.eventEmitter2.emit('withdraw.request-cash', new RequestWithdrawCashEvent(userId, sentAmount, referenceId));
    return await this.withdrawRepository.create(withdrawData);
  }

  async withdrawCashManagedWallet(userId: string, walletId: string, withdrawCashMangedWalletDto: WithdrawCashMangedWalletDto) {
    await this.walletsService.checkAndChargeWalletGas(walletId);
    // Burn GUSD tokens from the user's wallet
    const receipt = await this.tokensService.burnTokens(walletId, 'GUSD', {
      amount: withdrawCashMangedWalletDto.gusdAmount,
    });

    return this.withdrawCash(userId, {
      ...withdrawCashMangedWalletDto,
      hashAddress: receipt.hash,
    });
  }

  async withdrawUsdt(walletId, email, transferTokenDto: TransferTokenDto) {
    // Verify OTP
    await this.verifyWithdrawOtp(email, transferTokenDto.otp);

    await this.walletsService.checkAndChargeWalletGas(walletId);

    return await this.tokensService.transfer(walletId, 'USDT', transferTokenDto);
  }

  async withdrawGmac(walletId, email, transferTokenDto: TransferTokenDto) {
    // Verify OTP
    await this.verifyWithdrawOtp(email, transferTokenDto.otp);

    await this.walletsService.checkAndChargeWalletGas(walletId);

    return await this.tokensService.transfer(walletId, 'GMAC', transferTokenDto);
  }

  async approveWithdrawCash(id: string, approveWithdrawCash: ApproveWithdrawCash) {
    const withdraw = await this.withdrawRepository.update(
      { _id: id },
      {
        ...approveWithdrawCash,
        status: WithdrawStatus.Approved,
      }
    );

    if (!withdraw) {
      throw new BadRequestException('Withdraw not found');
    }

    return await this.updateInvoiceUrl(withdraw);
  }

  async rejectWithdrawCash(id: string, rejectWithdrawCash: RejectWithdrawCash) {
    const withdraw = await this.withdrawRepository.update(
      { _id: id },
      {
        ...rejectWithdrawCash,
        status: WithdrawStatus.Rejected,
      }
    );

    if (!withdraw) {
      throw new BadRequestException('Withdraw not found');
    }

    return await this.updateInvoiceUrl(withdraw);
  }

  async sendWithdrawOtp(email: string): Promise<void> {
    await this.otpService.generateUserOtp(email, 'WithdrawalConfirm');
  }

  async verifyWithdrawOtp(email: string, otp: string): Promise<void> {
    await this.otpService.verifyUserOtp(email, otp, 'WithdrawalConfirm');
  }

  private calculateSentAmount(totalAmount: number, exchangeRate: number) {
    const sentAmount = totalAmount * exchangeRate;
    return formatNumberToTwoDecimals(sentAmount);
  }

  private async generateReferenceId(): Promise<string> {
    const referenceId = generateRandomString(10);

    // Check if the reference ID already exists
    const isReferenceIdExists = await this.withdrawRepository.findOne({
      referenceId,
    });
    if (isReferenceIdExists) {
      return await this.generateReferenceId();
    }
    return referenceId;
  }

  private async updateInvoiceUrl(deposit: Withdraw): Promise<Withdraw> {
    if (deposit?.invoice) {
      deposit.invoice['url'] = await this.s3Service.getInvoiceObjectSignedUrl(deposit.invoice['filename']);
    }
    return deposit;
  }

  async getTotalWithdraw(userId: string) {
    const result = await this.withdrawRepository.model.aggregate([
      { $match: { userId: new Types.ObjectId(userId), status: WithdrawStatus.Approved } },
      {
        $group: {
          _id: null,
          totalSentAmount: { $sum: "$sentAmount" }
        }
      }
    ])
    return result.length > 0 ? result[0].totalSentAmount : 0
  }
}
