import { IsArray, IsInt, IsOptional, IsString } from 'class-validator';

export class FilterDto {
  @IsOptional()
  @IsInt()
  readingTimeMinutes: number;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags: string[];

  @IsOptional()
  @IsInt()
  positiveReactionsCount: number;
}
