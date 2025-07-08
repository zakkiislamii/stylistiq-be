import {
  IsArray,
  IsISO8601,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';

export class CreateScheduleDto {
  @IsISO8601({ strict: true })
  @IsNotEmpty()
  date: string;

  @IsString()
  @IsOptional()
  note?: string;

  @IsISO8601({ strict: true })
  @IsOptional()
  reminder?: string;

  @IsArray()
  @IsUUID('4', { each: true })
  @IsOptional()
  clothesIds?: string[];
}
