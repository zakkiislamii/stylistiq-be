import { IsOptional, IsNumber } from 'class-validator';

export class UpdateUserBodyProfileDto {
  @IsOptional()
  @IsNumber()
  chestCircumference?: number;

  @IsOptional()
  @IsNumber()
  waistCircumference?: number;

  @IsOptional()
  @IsNumber()
  hipCircumference?: number;

  @IsOptional()
  @IsNumber()
  shoulderWidth?: number;

  @IsOptional()
  @IsNumber()
  armLength?: number;

  @IsOptional()
  @IsNumber()
  legLength?: number;

  @IsOptional()
  @IsNumber()
  height?: number;

  @IsOptional()
  @IsNumber()
  weight?: number;
}
