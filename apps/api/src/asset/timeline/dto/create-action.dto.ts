import { IsNotEmpty, IsOptional, IsString } from "class-validator";
import { ActionInterface } from "../interface/action.interface";

export class CreateActionDto implements ActionInterface {
  @IsNotEmpty()
  @IsString()
  title: string;

  @IsOptional()
  @IsString()
  message: string;
}