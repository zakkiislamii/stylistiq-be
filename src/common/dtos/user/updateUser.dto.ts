import {
  IsOptional,
  IsString,
  IsNumber,
  IsDate,
  IsEnum,
} from 'class-validator';
import { Type } from 'class-transformer';
import { Gender } from 'src/common/enums/gender.enum';

export class UpdateUserDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  age?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  height?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  weight?: number;

  @IsOptional()
  @Type(() => Date)
  @IsDate()
  birthday?: Date;

  @IsOptional()
  @IsEnum(Gender)
  gender?: Gender;

  @IsOptional()
  @IsString()
  profilePhoto?: string;
}
