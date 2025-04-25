import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { File } from '../../file/schemas/file.schema';
import { DocType } from '../enums/doc-type.enum';

@Schema({ collection: 'assets' })
export class DocumentAsset extends Document {
  @Prop({ type: Number, enum: DocType, default: DocType.GENERAL })
  type: DocType;


  @Prop({
    type: [{ type: Types.ObjectId, ref: File.name, autopopulate: true }],
  })
  docs: File[] | string[];

}

export const DocumentAssetSchema =
  SchemaFactory.createForClass(DocumentAsset);
