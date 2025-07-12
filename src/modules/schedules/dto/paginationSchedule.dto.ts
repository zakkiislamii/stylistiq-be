import { IsISO8601, IsOptional } from 'class-validator';

export class PaginationScheduleDto {
  @IsISO8601({ strict: true })
  @IsOptional()
  startDate?: string;

  @IsISO8601({ strict: true })
  @IsOptional()
  endDate?: string;
}
