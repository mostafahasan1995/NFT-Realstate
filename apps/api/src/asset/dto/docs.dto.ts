import { IsArray, IsMongoId } from 'class-validator';

export class DocsDto {
  @IsArray()
  @IsMongoId({ each: true })
  readonly docs: string[];
}
