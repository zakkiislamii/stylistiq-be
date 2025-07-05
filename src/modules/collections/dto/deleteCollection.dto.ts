import { IsArray, IsUUID } from 'class-validator';

export class DeleteCollectionDto {
  @IsArray()
  @IsUUID('all', { each: true })
  collectionIds: string[];
}
