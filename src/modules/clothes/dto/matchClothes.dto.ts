import { IsArray, IsUUID } from 'class-validator';

export class MatchClothesDto {
  @IsArray()
  @IsUUID('all', { each: true })
  clothesIds: string[];
}
