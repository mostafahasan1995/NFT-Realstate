import { BadRequestException, HttpException, Injectable, NotFoundException } from '@nestjs/common';
import { Deposit } from './schemas/deposit.schema';
import { UpdateDepositDto } from './dto/update-deposit.dto';
import { DepositBankTransferDto } from './dto/deposit-bank-transfer.dto';
import { generateRandomString } from '../../common/utils/random-string-generator.util';
import { PaginationQueryDto } from '../../common/pagination/dto/pagination-query.dto';
import { DepositStatus } from './enums/deposit-status.enum';
import { ApproveDepositDto } from './dto/approve-deposit.dto';
import { RejectDepositDto } from './dto/reject-deposit.dto';
import { S3Service } from '../../aws/s3/s3.service';
import { SearchQueryDto } from '../../common/pagination/dto/search-query.dto';
import { formatNumberToTwoDecimals } from '../../common/utils/format-number-to-decimal.util';
import { DepositRepository } from './deposit.repository';
import { FilterQuery } from '../../common/pagination/interfaces/filter-query.interface';
import { PipelineStage, Types } from 'mongoose';
import { SearchDepositDto } from './dto/search-deposit.dto';

@Injectable()
export class DepositService {
  constructor(
    public readonly depositRepository: DepositRepository,
    private readonly s3Service: S3Service,
  ) { }

  async findWithPagination(
    paginationQueryDto: PaginationQueryDto,
    filterQueryDto: SearchQueryDto
  ) {
    const { search } = filterQueryDto;

    // Create an empty filter object with dynamic properties.
    const filter: FilterQuery = {};

    if (search !== undefined) {
      filter.$or = [
        { referenceId: { $regex: search, $options: 'i' } },
      ];
    }

    const result = await this.depositRepository.findWithPagination(
      paginationQueryDto,
      filter
    );

    // Update invoice URL with signed URL
    const updatedData = await Promise.all(
      result.data.map(async (deposit) => {
        return await this.updateInvoiceUrl(deposit);
      })
    );

    return {
      ...result,
      data: updatedData,
    };
  }


  async searchDeposit({ name, email, ...searchDepositDto }: SearchDepositDto) {
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

    match = { ...match, ...searchDepositDto }
    const pipeline: PipelineStage[] = [
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
    const deposits = await this.depositRepository.model.aggregate(pipeline);

    if (deposits.length === 0)
      throw new HttpException('deposits is Not Found', 201);

    return deposits
  }

  async findAll(): Promise<Deposit[]> {
    return await this.depositRepository.find();
  }

  async findOne(id: string): Promise<Deposit> {
    const deposit = await this.depositRepository.findOne({ _id: id });
    return await this.updateInvoiceUrl(deposit);
  }

  async updateDeposit(id: string, updateDepositDto: UpdateDepositDto) {
    const isDepositEx = await this.depositRepository.findOne({ _id: id });

    if (!isDepositEx) {
      throw new BadRequestException('Deposit not found');
    }

    const deposit = await this.depositRepository.update(
      { _id: id },
      updateDepositDto
    );

    return await this.updateInvoiceUrl(deposit);
  }

  async approveDeposit(id: string, approveDepositDto: ApproveDepositDto) {
    const deposit = await this.depositRepository.update(
      { _id: id },
      { ...approveDepositDto, status: DepositStatus.Approved }
    );

    if (!deposit) {
      throw new BadRequestException('Deposit not found');
    }

    return await this.updateInvoiceUrl(deposit);
  }

  async rejectDeposit(id: string, rejectDepositDto: RejectDepositDto) {
    const deposit = await this.depositRepository.update(
      { _id: id },
      {
        ...rejectDepositDto,
        status: DepositStatus.Rejected,
      }
    );

    if (!deposit) {
      throw new BadRequestException('Deposit not found');
    }

    return await this.updateInvoiceUrl(deposit);
  }

  async depositBankTransfer(
    userId: string,
    depositBankTransferDto: DepositBankTransferDto
  ): Promise<Deposit> {
    // Generate reference ID
    const referenceId = await this.generateReferenceId();

    // Calculate GUSD amount
    const gusdAmount = this.calculateGusdAmount(
      depositBankTransferDto.totalAmount,
      depositBankTransferDto.exchangeRate
    );

    return await this.depositRepository.create({
      ...depositBankTransferDto,
      userId,
      referenceId,
      gusdAmount,
    });
  }

  async findByUserId(userId: string): Promise<Deposit[]> {
    return await this.depositRepository.find({
      userId: new Types.ObjectId(userId),
    });
  }

  private calculateGusdAmount(totalAmount: number, exchangeRate: number) {
    const gusdAmount = totalAmount / exchangeRate;
    return formatNumberToTwoDecimals(gusdAmount);
  }

  private async generateReferenceId(): Promise<string> {
    const referenceId = generateRandomString(10);

    // Check if the reference ID already exists
    const isReferenceIdExists = await this.depositRepository.findOne({
      referenceId,
    });
    if (isReferenceIdExists) {
      return await this.generateReferenceId();
    }
    return referenceId;
  }

  private async updateInvoiceUrl(deposit: Deposit): Promise<Deposit> {
    if (deposit?.invoice) {
      deposit.invoice['url'] = await this.s3Service.getInvoiceObjectSignedUrl(
        deposit.invoice['filename']
      );
    }
    return deposit;
  }

  async getTotalDeposit(userId: string) {
    const result = await this.depositRepository.model.aggregate([
      {
        $match: { userId: new Types.ObjectId(userId), status: DepositStatus.Approved },
      },
      {
        $group: {
          _id: null,
          totalSentAmount: { $sum: "$totalAmount" },
        },
      },
    ]);

    return result.length > 0 ? result[0].totalSentAmount : 0;
  }
}
