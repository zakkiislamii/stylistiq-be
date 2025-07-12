import { Transform } from 'class-transformer';
import {
  IsArray,
  IsISO8601,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';

export class UpdateScheduleDto {
  @IsISO8601({ strict: true })
  @IsNotEmpty()
  date: string;

  @IsString()
  @IsOptional()
  note?: string;

  @IsISO8601({ strict: true })
  @IsOptional()
  reminder?: string;

  @IsOptional()
  @IsArray()
  @IsUUID('4', { each: true })
  @Transform(({ value }) => {
    if (Array.isArray(value) && value.length === 1 && value[0] === '') {
      return [];
    }
    return undefined;
  })
  clothesIds?: string[];
}
