import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { IFundingRequests } from '../interface/funding-requests.interface';
import { File } from '../../file/schemas/file.schema';
import { ProjectType } from '../enum/project-type.enum';
import { AdditionalSupportNeeded } from '../enum/additional-support-needed.enum';
import { Form } from './form.schema';

@Schema({ timestamps: true })
export class FundingRequests extends Document implements IFundingRequests {

  @Prop()
  projectName: string;

  @Prop({
    type: String,
    enum: Object.values(ProjectType),
  })
  projectType: string;

  @Prop()
  projectLocation: string;

  @Prop()
  projectDescription: string;

  @Prop()
  projectVisionAndGoals: string;

  @Prop()
  projectTotalCost: number;

  @Prop()
  requestedFundingAmount: number;

  @Prop({
    type: Types.ObjectId,
    ref: File.name,
  })
  businessPlansAndBudgets: File[] | string[];

  @Prop()
  projectStatus: string;

  @Prop()
  requiredPermits: string;

  @Prop({
    type: Types.ObjectId,
    ref: File.name,
  })
  buildingPermitsAndStudies: File[] | string[];

  @Prop()
  projectTimeline: string;

  @Prop({
    type: [String],
    enum: Object.values(AdditionalSupportNeeded),
  })
  additionalSupportNeeded: AdditionalSupportNeeded[];

  @Prop({
    type: Types.ObjectId,
    ref: File.name,
  })
  videoUpload: File | string;

  @Prop()
  workReferences: string;

  @Prop()
  informationVerification: string;

  @Prop({
    type: Types.ObjectId,
    ref: Form.name,
    autopopulate: true,
  })
  contactId: Form | string;

  createdAt: Date;
  updatedAt: Date;
}

export const FundingRequestsSchema = SchemaFactory.createForClass(FundingRequests);
