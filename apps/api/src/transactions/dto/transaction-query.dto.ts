import { Transform } from "class-transformer"
import { IsDate } from "class-validator"

export class TransactionQueryDto {
  @Transform(({ value }) => new Date(value))
  @IsDate()
  startDate: Date

  @Transform(({ value }) => new Date(value))
  @IsDate()
  endDate: Date
}