import { Exclude, Type } from 'class-transformer';
import { Asset } from '../schemas/asset.schema';
import { FileSerializerDto } from '../../file/dto/file-serializer.dto';
import { TransformObjectId } from '../../common/decorators/transform-objectId.decorator';
import { MarketValueLogs } from '../schemas/market-value.schema';

export class AssetSerializerDto {
  @TransformObjectId()
  _id: string;

  @Type(() => FileSerializerDto)
  assetBlueprintImage: File | string;

  @Type(() => FileSerializerDto)
  images: File[] | string[];

  @Type(() => FileSerializerDto)
  docs: File[] | string[];

  @Type(() => FileSerializerDto)
  incomeDocs: File[] | string[];

  @Type(() => FileSerializerDto)
  marketValueDocs: File[] | string[];

  @Exclude()
  marketValueLogs: MarketValueLogs[] | string[];

  @Exclude()
  createdAt: Date;

  @Exclude()
  updatedAt: Date;

  @Exclude()
  __v: number;

  constructor(partial: Partial<Asset>) {
    Object.assign(this, partial.toJSON ? partial.toJSON() : partial);
  }
}
