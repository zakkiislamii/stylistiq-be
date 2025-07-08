import { IsArray, IsUUID } from 'class-validator';

export class DeleteClothesDto {
  @IsArray()
  @IsUUID('all', { each: true })
  clothesIds: string[];
}
