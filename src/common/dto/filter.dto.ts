import { IsArray, IsInt, IsOptional, IsString, Min } from 'class-validator';

export class FilterDto {
  @IsOptional()
  @IsString()
  q?: string;

  @IsOptional()
  @IsInt()
  @Min(1, { message: 'Page number must be at least 1.' })
  page: number = 1;

  @IsOptional()
  @IsInt()
  @Min(1, { message: 'Items per page must be at least 1.' })
  perPage: number = 10;

  @IsOptional()
  @IsInt()
  @Min(0, { message: 'Reading time must be non-negative.' })
  readingTimeMinutes?: number;

  @IsOptional()
  @IsInt()
  @Min(0, { message: 'Positive reactions count must be non-negative.' })
  positiveReactionsCount?: number;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];
}
