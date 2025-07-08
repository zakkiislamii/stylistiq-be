import { IsArray, IsNotEmpty, IsUUID } from 'class-validator';

export class DeleteScheduleDto {
  @IsArray()
  @IsUUID('4', { each: true })
  @IsNotEmpty()
  scheduleIds: string[];
}
