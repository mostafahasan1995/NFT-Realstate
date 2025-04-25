import { IsArray, IsEnum, IsNumber, IsOptional, IsString } from "class-validator";
import { IFundingRequests } from "../interface/funding-requests.interface";
import { ProjectType } from "../enum/project-type.enum";
import { AdditionalSupportNeeded } from "../enum/additional-support-needed.enum";

export class FormFundingDto implements IFundingRequests {
  @IsString()
  token: string;

  @IsString()
  contactId: string;

  @IsString()
  projectName: string;

  @IsEnum(ProjectType)
  projectType: string;

  @IsString()
  projectLocation: string;

  @IsString()
  projectDescription: string;

  @IsString()
  projectVisionAndGoals: string;

  @IsNumber()
  projectTotalCost: number;

  @IsNumber()
  requestedFundingAmount: number;

  @IsOptional()
  @IsString({ each: true })
  businessPlansAndBudgets: string[];

  @IsString()
  projectStatus: string;

  @IsString()
  @IsOptional()
  requiredPermits: string;

  @IsOptional()
  @IsString({ each: true })
  buildingPermitsAndStudies: string[];

  @IsOptional()
  @IsString()
  projectTimeline: string;

  @IsEnum(AdditionalSupportNeeded, { each: true })
  additionalSupportNeeded: AdditionalSupportNeeded[];

  @IsOptional()
  @IsString()
  videoUpload: string;

  @IsString()
  workReferences: string;

  @IsString()
  informationVerification: string;

  createdAt: Date;
  updatedAt: Date;
}