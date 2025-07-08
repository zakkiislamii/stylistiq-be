import {
  IsArray,
  IsISO8601,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';
import { Timestamp } from 'typeorm';

export class UpdateScheduleDto {
  @IsISO8601({ strict: true })
  @IsNotEmpty()
  date: Date;

  @IsString()
  @IsOptional()
  note?: string;

  @IsISO8601({ strict: true })
  @IsOptional()
  reminder?: Timestamp;

  @IsArray()
  @IsUUID('4', { each: true })
  @IsOptional()
  clothesIds?: string[];
}
