import { IsArray, IsUUID } from 'class-validator';

export class AddClothesToCollectionDto {
  @IsArray()
  @IsUUID('all', { each: true })
  clothesIds: string[];
}
