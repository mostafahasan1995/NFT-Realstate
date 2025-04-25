import { Exclude } from 'class-transformer';
import { File } from '../schemas/file.schema';
import { TransformObjectId } from '../../common/decorators/transform-objectId.decorator';

export class FileSerializerDto {
  @TransformObjectId()
  _id: string;

  @Exclude()
  originalname: string;

  @Exclude()
  filename: string;

  @Exclude()
  createdAt: Date;

  @Exclude()
  updatedAt: Date;

  @Exclude()
  __v: number;

  constructor(partial: Partial<File>) {
    Object.assign(this, partial.toJSON ? partial.toJSON() : partial);
  }
}
