import { File } from "apps/api/src/file/schemas/file.schema";
import { AdditionalSupportNeeded } from "../enum/additional-support-needed.enum";

export type IFundingRequests = {

  projectName: string;
  projectType: string;
  projectLocation: string;
  projectDescription: string;
  projectVisionAndGoals: string;
  projectTotalCost: number;
  requestedFundingAmount: number;
  businessPlansAndBudgets: File[] | string[]
  projectStatus: string;
  requiredPermits: string;
  buildingPermitsAndStudies: File[] | string[]
  projectTimeline: string;
  additionalSupportNeeded: AdditionalSupportNeeded[];
  videoUpload: File | string;
  workReferences: string
  informationVerification: string;
  createdAt: Date;
  updatedAt: Date;
}